# Common Patterns & Examples

This guide covers common use cases and best practices for working with T_Lib in real robot code.

## Basic Motor Control

### Simple Single Motor
```cpp
#include "main.h"
#include "T_Lib/api.hpp"

void opcontrol() {
    T_Lib::T_Motor motor(1);
    pros::Controller master(pros::E_CONTROLLER_MASTER);
    
    while (true) {
        if (master.get_digital(pros::E_CONTROLLER_DIGITAL_A)) {
            motor.setTargetRPM(600);
        } else {
            motor.stop();
        }
        
        pros::delay(20);
    }
}
```

### Motor with Configuration
```cpp
void opcontrol() {
    T_Lib::T_Motor motor(1, T_Lib::util::Aliases::Blue);
    
    // Configure motor behavior
    motor.setDualConstants(0.05, 0.1, 0.05, 0.05);
    motor.setBrakeMode(T_Lib::util::Aliases::Hold);
    motor.setLoadCompensation(true, 5.0, 15);
    motor.setMinTorque(true, 1200, 600);
    
    pros::Controller master(pros::E_CONTROLLER_MASTER);
    
    while (true) {
        if (master.get_digital(pros::E_CONTROLLER_DIGITAL_A)) {
            motor.setTargetPercent(75);  // 75% power
        } else {
            motor.stop();
        }
        
        // Print telemetry
        printf("RPM: %f, Temp: %f C\n", motor.getRPM(), motor.getTemperature());
        
        pros::delay(20);
    }
}
```

## Drivetrain Patterns

### Tank Drive with Motor Groups
```cpp
#include "main.h"
#include "T_Lib/api.hpp"

void opcontrol() {
    // Create motor groups for left and right sides
    T_MotorGroup left_motors({1, 2, 3});
    T_MotorGroup right_motors({4, 5, 6});
    
    // Configure both sides identically
    for (auto* group : {&left_motors, &right_motors}) {
        group->setDualConstants(0.05, 0.1, 0.05, 0.05);
        group->setBrakeMode(T_Lib::util::Aliases::Hold);
        group->setLoadCompensation(true, 5.0);
        group->setMinTorque(true, 1200, 600);
    }
    
    pros::Controller master(pros::E_CONTROLLER_MASTER);
    
    while (true) {
        // Arcade drive
        int forward = master.get_analog(ANALOG_LEFT_Y);
        int turn = master.get_analog(ANALOG_RIGHT_X);
        
        left_motors.setTargetPercent(forward + turn);
        right_motors.setTargetPercent(forward - turn);
        
        pros::delay(20);
    }
}
```

### Tank Drive with Slow Mode
```cpp
void opcontrol() {
    T_MotorGroup left_motors({1, 2, 3});
    T_MotorGroup right_motors({4, 5, 6});
    
    // Configure groups
    left_motors.setDualConstants(0.05, 0.1, 0.05, 0.05);
    right_motors.setDualConstants(0.05, 0.1, 0.05, 0.05);
    left_motors.setBrakeMode(T_Lib::util::Aliases::Hold);
    right_motors.setBrakeMode(T_Lib::util::Aliases::Hold);
    
    pros::Controller master(pros::E_CONTROLLER_MASTER);
    bool slow_mode = false;
    
    while (true) {
        // Toggle slow mode
        if (master.get_digital_new_press(pros::E_CONTROLLER_DIGITAL_X)) {
            slow_mode = !slow_mode;
        }
        
        int forward = master.get_analog(ANALOG_LEFT_Y);
        int turn = master.get_analog(ANALOG_RIGHT_X);
        
        // Apply slow mode multiplier
        if (slow_mode) {
            forward *= 0.6;
            turn *= 0.6;
        }
        
        left_motors.setTargetPercent(forward + turn);
        right_motors.setTargetPercent(forward - turn);
        
        printf("%s Mode\n", slow_mode ? "SLOW" : "NORMAL");
        pros::delay(20);
    }
}
```

## Subsystem Architecture

### Motor Subsystem Class
```cpp
#include "main.h"
#include "T_Lib/api.hpp"

class IntakeSystem {
private:
    T_Lib::T_Motor intake_motor;
    bool running = false;
    
public:
    IntakeSystem(int port) 
        : intake_motor(port, T_Lib::util::Aliases::Green) {
        // Configure motor
        intake_motor.setDualConstants(0.05, 0.1, 0.05, 0.05);
        intake_motor.setLoadeCompensation(true);
        intake_motor.setBrakeMode(T_Lib::util::Aliases::Coast);
    }
    
    void start() {
        intake_motor.setTargetRPM(200);
        running = true;
    }
    
    void reverse() {
        intake_motor.setTargetRPM(-200);
        running = true;
    }
    
    void stop() {
        intake_motor.stop();
        running = false;
    }
    
    bool isRunning() const {
        return running;
    }
};

class Drivetrain {
private:
    T_MotorGroup left_motors;
    T_MotorGroup right_motors;
    
public:
    Drivetrain(const std::vector<int>& left_ports, 
               const std::vector<int>& right_ports)
        : left_motors(left_ports), right_motors(right_ports) {
        
        // Configure
        left_motors.setDualConstants(0.05, 0.1, 0.05, 0.05);
        right_motors.setDualConstants(0.05, 0.1, 0.05, 0.05);
        
        left_motors.setBrakeMode(T_Lib::util::Aliases::Hold);
        right_motors.setBrakeMode(T_Lib::util::Aliases::Hold);
    }
    
    void arcadeDrive(double forward, double turn) {
        left_motors.setTargetPercent(forward + turn);
        right_motors.setTargetPercent(forward - turn);
    }
    
    void stop() {
        left_motors.stop();
        right_motors.stop();
    }
    
    double getLeftRPM() const { return left_motors.getAverageRPM(); }
    double getRightRPM() const { return right_motors.getAverageRPM(); }
};

// Global subsystem instances
Drivetrain g_drivetrain({1, 2, 3}, {4, 5, 6});
IntakeSystem g_intake(7);

void opcontrol() {
    pros::Controller master(pros::E_CONTROLLER_MASTER);
    
    while (true) {
        // Intake control
        if (master.get_digital(pros::E_CONTROLLER_DIGITAL_R1)) {
            g_intake.start();
        } else if (master.get_digital(pros::E_CONTROLLER_DIGITAL_R2)) {
            g_intake.reverse();
        } else {
            g_intake.stop();
        }
        
        // Drive control
        int forward = master.get_analog(ANALOG_LEFT_Y);
        int turn = master.get_analog(ANALOG_RIGHT_X);
        g_drivetrain.arcadeDrive(forward, turn);
        
        // Telemetry
        printf("L: %.0f, R: %.0f | Intake: %s\n",
               g_drivetrain.getLeftRPM(),
               g_drivetrain.getRightRPM(),
               g_intake.isRunning() ? "ON" : "OFF");
        
        pros::delay(20);
    }
}
```

## Advanced Control Patterns

### PID Tuning with Live Adjustment
```cpp
void tuneMotorPID() {
    T_Lib::T_Motor motor(1);
    pros::Controller master(pros::E_CONTROLLER_MASTER);
    
    double kv = 0.05;
    double kp = 0.1;
    double ki = 0.001;
    double kd = 0.05;
    
    motor.setLowConstants(kv, kp, ki, kd);
    
    while (true) {
        // Adjust constants in real-time
        if (master.get_digital(pros::E_CONTROLLER_DIGITAL_A)) {
            kp += 0.01;
            motor.setLowConstants(kv, kp, ki, kd);
            printf("KP: %.4f\n", kp);
            pros::delay(100);
        }
        if (master.get_digital(pros::E_CONTROLLER_DIGITAL_B)) {
            kp -= 0.01;
            motor.setLowConstants(kv, kp, ki, kd);
            printf("KP: %.4f\n", kp);
            pros::delay(100);
        }
        
        // Run motor at target
        motor.setTargetRPM(600);
        printf("RPM: %.1f\n", motor.getRPM());
        
        pros::delay(20);
    }
}
```

### Load Detection and Response
```cpp
#include "main.h"
#include "T_Lib/api.hpp"

class LoadSensitiveMotor {
private:
    T_Lib::T_Motor motor;
    bool overloaded = false;
    
public:
    LoadSensitiveMotor(int port) 
        : motor(port) {
        motor.setLoadCompensation(true, 5.0, 15);
        motor.setMinTorque(true, 1200, 600);
    }
    
    void setTargetRPM(double rpm) {
        motor.setTargetRPM(rpm);
    }
    
    void update() {
        // Check if motor is under heavy load
        // High current draw with low RPM indicates load
        int voltage = motor.getVoltage();
        double rpm = motor.getRPM();
        
        if (voltage > 11000 && rpm < 100) {  // Near max voltage, very slow
            overloaded = true;
        } else {
            overloaded = false;
        }
    }
    
    bool isOverloaded() const {
        return overloaded;
    }
    
    double getTemperature() const {
        return motor.getTemperature();
    }
};

void opcontrol() {
    LoadSensitiveMotor motor(1);
    
    while (true) {
        motor.setTargetRPM(600);
        motor.update();
        
        if (motor.isOverloaded()) {
            printf("⚠️ MOTOR OVERLOADED! Temp: %.1f C\n", motor.getTemperature());
        }
        
        pros::delay(20);
    }
}
```

## Autonomous Patterns

### Time-Based Movement
```cpp
void autonomous() {
    T_MotorGroup left({1, 2, 3});
    T_MotorGroup right({4, 5, 6});
    
    left.setDualConstants(0.05, 0.1, 0.05, 0.05);
    right.setDualConstants(0.05, 0.1, 0.05, 0.05);
    
    // Drive forward for 2 seconds
    left.setTargetPercent(75);
    right.setTargetPercent(75);
    pros::delay(2000);
    
    // Turn right for 1 second
    left.setTargetPercent(75);
    right.setTargetPercent(-75);
    pros::delay(1000);
    
    // Stop
    left.stop();
    right.stop();
}
```

### Encoder-Based Movement
```cpp
void driveDistance(T_MotorGroup& left, T_MotorGroup& right, 
                    double distance_inches, double power_percent) {
    using namespace T_Lib::util;
    
    // Reset encoders
    left.resetPositions();
    right.resetPositions();
    
    double wheel_diameter = Wheel_Size::Trac_4in;
    double circumference = M_PI * wheel_diameter;
    double target_counts = (distance_inches / circumference) * 360.0;
    
    // Drive at target power
    left.setTargetPercent(power_percent);
    right.setTargetPercent(power_percent);
    
    // Wait until both sides exceed target distance
    while (true) {
        double left_distance = left.getMotors()[0]->getPosition();
        double right_distance = right.getMotors()[0]->getPosition();
        
        if (left_distance > target_counts && right_distance > target_counts) {
            break;
        }
        
        pros::delay(20);
    }
    
    left.stop();
    right.stop();
}

void autonomous() {
    T_MotorGroup left({1, 2, 3});
    T_MotorGroup right({4, 5, 6});
    
    left.setDualConstants(0.05, 0.1, 0.05, 0.05);
    right.setDualConstants(0.05, 0.1, 0.05, 0.05);
    
    // Drive forward 24 inches
    driveDistance(left, right, 24.0, 75.0);
    
    // Turn (spin)
    left.setTargetPercent(75);
    right.setTargetPercent(-75);
    pros::delay(800);  // Adjust time for 90-degree turn
    
    left.stop();
    right.stop();
}
```

## Troubleshooting Patterns

### Debug Output Macro
```cpp
#define DEBUG_PRINT(...) do { \
    printf(__VA_ARGS__); \
    printf("\n"); \
} while(0)

void debugMotor(T_Lib::T_Motor& motor, const char* name) {
    DEBUG_PRINT("%s - RPM: %.1f | Temp: %.1f°C | Voltage: %d mV",
                name, motor.getRPM(), motor.getTemperature(), motor.getVoltage());
}
```

### Monitoring Multiple Motors
```cpp
void monitorDrivetrain(T_MotorGroup& left, T_MotorGroup& right) {
    printf("LEFT MOTORS:\n");
    for (size_t i = 0; i < left.getMotors().size(); ++i) {
        auto& motor = left.getMotors()[i];
        printf("  [%zu] RPM: %.1f, Temp: %.1f C\n", 
               i, motor->getRPM(), motor->getTemperature());
    }
    
    printf("RIGHT MOTORS:\n");
    for (size_t i = 0; i < right.getMotors().size(); ++i) {
        auto& motor = right.getMotors()[i];
        printf("  [%zu] RPM: %.1f, Temp: %.1f C\n", 
               i, motor->getRPM(), motor->getTemperature());
    }
}
```

## Best Practices

1. **Always configure motors early**: Set PID constants, brake mode, and protection features during initialization
2. **Use motor groups for synchronized control**: Reduces code duplication and ensures consistent behavior
3. **Implement telemetry**: Use periodic debug output to monitor motor health and performance
4. **Test PID constants**: Tune dual constants for your specific gearset and load
5. **Use load compensation**: Enables motors to maintain speed under variable loads
6. **Apply slew limiting**: Reduces wheel slip and mechanical stress in rapid acceleration
7. **Organize code with subsystem classes**: Makes autonomous and teleop more manageable
