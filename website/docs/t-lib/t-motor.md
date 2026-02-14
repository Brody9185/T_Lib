# T_Motor API

The `T_Motor` class provides advanced control over a single V5 motor with features including real-time PID control, slew limiting, load compensation, and anti-stall protection. All control operations are non-blocking, running in a background task.

## Constructor

```cpp
T_Motor(int port, pros::v5::MotorGears gearset = util::Aliases::Blue, bool reversed = false);
```

### Parameters
- `port`: Motor port number (1-21)
- `gearset`: Motor gearset (Blue, Green, or Red) - defaults to Blue (600 RPM)
  - `util::Aliases::Blue`: 600 RPM gearset
  - `util::Aliases::Green`: 200 RPM gearset
  - `util::Aliases::Red`: 100 RPM gearset
- `reversed`: Whether the motor direction is reversed (default: false)

### Example
```cpp
// Blue gear motor on port 3
T_Lib::T_Motor motor(3);

// Red gear motor on port 5, reversed direction
T_Lib::T_Motor motor2(5, T_Lib::util::Aliases::Red, true);
```

## Control Commands

### setTargetRPM
Sets the target RPM for the motor using PID control.

```cpp
void setTargetRPM(double rpm);
```

### setTargetPercent
Sets the target power as a percentage (0-100%).

```cpp
void setTargetPercent(double percent);
void setTargetPercent(T_Lib::util::units::Percentage percent);
```

### stop
Stops the motor immediately.

```cpp
void stop();
```

### Example
```cpp
motor.setTargetRPM(600);    // Set to 600 RPM
motor.setTargetPercent(75); // Set to 75% power
motor.stop();               // Stop the motor
```

## PID Control

### Overview
T_Motor uses a dual-speed PID controller to manage motor speed smoothly and accurately. The "low" speed constants control behavior at lower speeds, while "high" speed constants take over at higher speeds.

### setPIDEnabled
Enable or disable PID control.

```cpp
void setPIDEnabled(bool enabled);
bool isPIDEnabled() const;
```

### setDualConstants
Set separate PID constants for low and high speed regimes.

```cpp
void setDualConstants(
    double kvLow, double kpLow, 
    double kvHigh, double kpHigh
);

void setDualConstants(
    double kvLow, double kpLow, double kiLow, double kdLow,
    double kvHigh, double kpHigh, double kiHigh, double kdHigh
);
```

### setLowConstants
Set PID constants for the low-speed regime.

```cpp
void setLowConstants(double kvLow, double kpLow);
void setLowConstants(double kvLow, double kpLow, double kiLow, double kdLow);
```

### setHighConstants
Set PID constants for the high-speed regime.

```cpp
void setHighConstants(double kvHigh, double kpHigh);
void setHighConstants(double kvHigh, double kpHigh, double kiHigh, double kdHigh);
```

### setStartI
Initialize the integral error term for smooth PID transitions.

```cpp
void setStartI(double startIntegral);
```

### Getter Methods
```cpp
double getLowKV() const;    double getLowKP() const;    double getLowKI() const;
double getLowKD() const;
double getHighKV() const;   double getHighKP() const;
double getHighKI() const;   double getHighKD() const;
double getStartI() const;
```

### Example
```cpp
// Set simple proportional constants for low and high speeds
motor.setDualConstants(
    0.05, 0.1,    // Low speed: kv, kp
    0.05, 0.05    // High speed: kv, kp
);

// Set full PID constants with integral and derivative terms
motor.setDualConstants(
    0.05, 0.1, 0.001, 0.05,    // Low speed: kv, kp, ki, kd
    0.05, 0.05, 0.0, 0.02       // High speed: kv, kp, ki, kd
);

// Check if PID is enabled
if (motor.isPIDEnabled()) {
    // PID is active
}
```

## Slew Control

Slew limiting restricts how quickly the motor can change speed, useful for preventing mechanical damage or reducing wheel slip.

### setSlewLimitEnabled
Enable or disable slew rate limiting.

```cpp
void setSlewLimitEnabled(bool enabled);
bool isSlewLimitEnabled() const;
```

### setSlewRate
Set the maximum RPM change per control loop iteration.

```cpp
void setSlewRate(double maxChange);
double getSlewRate() const;
```

### Example
```cpp
// Enable slew with a limit of 500 RPM change per iteration
motor.setSlewLimitEnabled(true);
motor.setSlewRate(500.0);
```

## Load Compensation

Load compensation automatically boosts motor voltage when the motor is struggling under load, helping maintain target speed.

### setLoadCompensation (3 overloads)
```cpp
void setLoadCompensation(bool enabled);
void setLoadCompensation(bool enabled, double kBoost);
void setLoadCompensation(bool enabled, double kBoost, int threshold);
```

### Parameters
- `enabled`: Enable or disable load compensation
- `kBoost`: Boost multiplier (default: 4.5)
- `threshold`: Current threshold in mA to trigger boost (default: 15 mA)

### Getter Methods
```cpp
bool isLoadCompEnabled() const;
double getLoadKBoost() const;
int getLoadThreshold() const;
```

### Example
```cpp
// Enable basic load compensation with defaults
motor.setLoadCompensation(true);

// Enable load compensation with custom boost
motor.setLoadCompensation(true, 5.0);

// Enable with custom boost and current threshold
motor.setLoadCompensation(true, 6.0, 20);
```

## Minimum Torque (Anti-Stall)

Minimum torque ensures the motor applies a minimum voltage, preventing complete stalling under heavy loads.

### setMinTorque (3 overloads)
```cpp
void setMinTorque(bool enabled);
void setMinTorque(bool enabled, int minMv);
void setMinTorque(bool enabled, int minMv, int minLowMv);
```

### Parameters
- `enabled`: Enable or disable minimum torque
- `minMv`: Minimum voltage for high speeds (default: 1200 mV)
- `minLowMv`: Minimum voltage for low speeds (default: 600 mV)

### Getter Methods
```cpp
bool isMinTorqueEnabled() const;
int getMinVoltageUser() const;
int getMinVoltageLow() const;
int getActiveMinVoltage() const;
```

### Example
```cpp
// Enable with default values
motor.setMinTorque(true);

// Custom minimum voltage
motor.setMinTorque(true, 1500);

// Different minimums for low and high speed
motor.setMinTorque(true, 1500, 800);
```

## Sensor & Status

### Speed and Position
```cpp
double getRPM() const;            // Current motor RPM
double getTargetRPM() const;      // Target RPM setpoint
double getPosition() const;       // Current encoder position
```

### Temperature and Voltage
```cpp
double getTemperature() const;    // Motor temperature in Celsius
int getVoltage() const;           // Current motor voltage in mV
int getVoltageLimit() const;      // Global voltage limit in mV
```

### Status Checks
```cpp
bool isSpinning() const;          // True if motor is spinning at target
bool isSpinningRaw() const;       // True if motor encoder is moving
```

### Example
```cpp
printf("RPM: %f, Temp: %f C, Voltage: %d mV\n", 
       motor.getRPM(), motor.getTemperature(), motor.getVoltage());

if (motor.isSpinning()) {
    printf("Motor is at target speed\n");
}
```

## Configuration

### setReversed
Reverse the motor direction.

```cpp
void setReversed(bool rev);
bool isReversed() const;
```

### setBrakeMode
Set the motor brake behavior.

```cpp
void setBrakeMode(pros::v5::MotorBrake mode);
```

### resetPosition
Reset the encoder position to zero.

```cpp
void resetPosition();
```

### getGearset
Query the motor's gearset.

```cpp
pros::v5::MotorGears getGearset() const;
```

### Example
```cpp
motor.setReversed(true);                          // Reverse direction
motor.setBrakeMode(T_Lib::util::Aliases::Hold);  // Hold position on stop
motor.resetPosition();                            // Zero the encoder
```

## Complete Example

```cpp
#include "main.h"
#include "T_Lib/api.hpp"

void opcontrol() {
    T_Lib::T_Motor motor(1, T_Lib::util::Aliases::Blue);
    
    // Configure PID and control
    motor.setDualConstants(0.05, 0.1, 0.05, 0.05);
    motor.setSlewLimitEnabled(true);
    motor.setSlewRate(300.0);
    motor.setLoadCompensation(true, 5.0, 15);
    motor.setMinTorque(true, 1200, 600);
    motor.setBrakeMode(T_Lib::util::Aliases::Hold);
    
    pros::Controller master(pros::E_CONTROLLER_MASTER);
    
    while (true) {
        if (master.get_digital(pros::E_CONTROLLER_DIGITAL_A)) {
            motor.setTargetRPM(600);
        } else {
            motor.stop();
        }
        
        printf("RPM: %f, Temp: %f\n", motor.getRPM(), motor.getTemperature());
        pros::delay(20);
    }
}
```
