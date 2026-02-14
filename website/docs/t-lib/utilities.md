# Utilities API

T_Lib provides comprehensive utility functions and constants to simplify robotics programming. This includes wheel size constants, convenient aliases for PROS enums, unit conversion helpers, and type-safe percentage operations.

## Wheel Sizes

T_Lib includes accurate measured diameter constants for common VEX wheels. These values are in inches and can be used for odometry calculations and distance conversions.

### 4-inch Wheels
```cpp
using namespace T_Lib::util::Wheel_Size;

double diameter = Omni_4in;       // 4.20070012 inches
diameter = Trac_4in;              // 4.000 inches
diameter = Trac_Flex_4in;         // 4.000 inches
diameter = Mech_4in;              // 4.000 inches (Mecanum)
```

### 3.25-inch Wheels
```cpp
double diameter = Omni_325in;     // 3.250 inches
diameter = Trac_325in;            // 3.250 inches
```

### 3-inch and Smaller Wheels
```cpp
double diameter = Trac_Flex_3in;  // 3.000 inches
diameter = Omni_275;              // 2.8545712802768 inches (2.75")
diameter = Trac_275;              // 2.750 inches

double diameter = Omni_2;         // 2.031548819 inches
diameter = Trac_2;                // 2.000 inches
diameter = Trac_Flex_2;           // 2.000 inches
diameter = Mech_2;                // 2.000 inches (Mecanum)

double diameter = Trac_Flex_1625in;  // 1.625 inches
```

### Example: Odometry Calculation
```cpp
#include "T_Lib/api.hpp"

double calculateDistance(int encoder_counts) {
    // Using a 4" diameter wheel
    double wheel_diameter = T_Lib::util::Wheel_Size::Trac_4in;
    double circumference = M_PI * wheel_diameter;
    
    // Assuming 360 counts per revolution
    double distance_inches = (encoder_counts / 360.0) * circumference;
    
    return distance_inches;
}
```

## Aliases

Convenient abbreviated names for common PROS enumerations.

### Motor Gearsets
```cpp
using namespace T_Lib::util::Aliases;

pros::v5::MotorGears gearset = Blue;    // 600 RPM
gearset = Green;                         // 200 RPM
gearset = Red;                           // 100 RPM
```

### Motor Brake Modes
```cpp
pros::v5::MotorBrake brake = Hold;      // Actively resist movement
brake = Brake;                           // Short motor terminals
brake = Coast;                           // Motor spins freely
```

### Encoder Units
```cpp
pros::v5::MotorEncoderUnits units = Counts;      // Raw encoder counts
units = Degrees;                                 // 0-360 degrees
units = Rotations;                              // Full rotations
```

### Example
```cpp
#include "T_Lib/api.hpp"

T_Lib::T_Motor motor(1, T_Lib::util::Aliases::Green);  // 200 RPM gearset
motor.setBrakeMode(T_Lib::util::Aliases::Hold);
```

## Unit Conversion

Helper functions for converting between common units.

### Distance Conversion

#### inches_to_mm
```cpp
double mm = T_Lib::util::unitConversion::inches_to_mm(4.0);
// mm = 101.6
```

#### mm_to_inches
```cpp
double inches = T_Lib::util::unitConversion::mm_to_inches(101.6);
// inches = 4.0
```

### Angle Conversion

#### degrees_to_radians
```cpp
double radians = T_Lib::util::unitConversion::degrees_to_radians(180.0);
// radians ≈ 3.14159 (π)
```

#### radians_to_degrees
```cpp
double degrees = T_Lib::util::unitConversion::radians_to_degrees(M_PI);
// degrees = 180.0
```

### Example: Odometry with Unit Conversion
```cpp
#include "T_Lib/api.hpp"

struct Pose2D {
    double x_mm, y_mm, theta_rad;
};

Pose2D calculatePose(int left_counts, int right_counts, int imu_angle) {
    using namespace T_Lib::util;
    
    // Calculate distance traveled
    double wheel_diameter = Wheel_Size::Trac_4in;
    double distance_inches = (left_counts / 360.0) * M_PI * wheel_diameter;
    
    // Convert to mm
    double distance_mm = unitConversion::inches_to_mm(distance_inches);
    
    // Convert IMU angle to radians
    double theta_rad = unitConversion::degrees_to_radians(imu_angle);
    
    return {
        distance_mm * cos(theta_rad),
        distance_mm * sin(theta_rad),
        theta_rad
    };
}
```

## Percentage Type

T_Lib provides a type-safe `Percentage` class with custom literal operators for safely handling percentage values.

### Percentage Class
```cpp
struct Percentage {
    double value_perc;  // Value from 0.0 to 100.0 (clamped)
    
    // Constructor (clamps value to 0-100)
    explicit Percentage(double value);
    
    // Apply percentage to a base value
    double applyTo(double base) const;
    
    // Operators
    Percentage operator+(const Percentage& other) const;
    Percentage operator*(double scalar) const;
    friend Percentage operator*(double scalar, const Percentage& perc);
};
```

### Custom Literal Operator

Use the `_perc` suffix to create percentage values concisely:

```cpp
using T_Lib::util::units::percentage_literals::operator"" _perc;

// Create percentages using custom literals
auto perc1 = 50_perc;        // 50%
auto perc2 = 100.0_perc;     // 100%
auto perc3 = (-10)_perc;     // Clamped to 0%
auto perc4 = 150_perc;       // Clamped to 100%
```

### Operations
```cpp
using namespace T_Lib::util::units::percentage_literals;

auto perc1 = 30_perc;
auto perc2 = 20_perc;

// Add percentages
auto sum = perc1 + perc2;    // 50%

// Multiply by scalar
auto scaled = perc1 * 2.0;   // 60%
auto left_mult = 2.0 * perc1; // 60%

// Apply to a base value
double base_voltage = 12000;  // mV
double result = (75_perc).applyTo(base_voltage);  // 9000 mV
```

### Example: Motor Control with Percentages
```cpp
#include "T_Lib/api.hpp"

void motorDemo() {
    using namespace T_Lib::util::units::percentage_literals;
    
    T_Lib::T_Motor motor(1);
    
    // Set power using percentage literals
    motor.setTargetPercent(75_perc);    // 75% power
    
    // Clamping prevents invalid values
    auto invalid = 150_perc;  // Clamped to 100%
    motor.setTargetPercent(invalid);
}
```

## Mathematical Constants

T_Lib defines the mathematical constant π:

```cpp
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
```

Use this for wheel diameter calculations and circular motion:

```cpp
double wheel_diameter = 4.0;  // inches
double circumference = M_PI * wheel_diameter;  // π × d
```

## Complete Example: Advanced Odometry

```cpp
#include "main.h"
#include "T_Lib/api.hpp"
#include <cmath>

class OdometryCalculator {
private:
    using namespace T_Lib::util;
    
    double wheel_diameter_inches;
    double counts_per_rotation;
    
public:
    struct Pose2D {
        double x_mm = 0;
        double y_mm = 0;
        double theta_degrees = 0;
    };
    
    OdometryCalculator() 
        : wheel_diameter_inches(Wheel_Size::Trac_4in),
          counts_per_rotation(360.0) {}
    
    Pose2D calculatePose(int left_counts, int right_counts, double imu_angle) {
        // Calculate distances traveled
        double left_distance = (left_counts / counts_per_rotation) 
                             * M_PI * wheel_diameter_inches;
        double right_distance = (right_counts / counts_per_rotation) 
                              * M_PI * wheel_diameter_inches;
        
        // Average distance
        double avg_distance = (left_distance + right_distance) / 2.0;
        
        // Convert to mm
        double distance_mm = unitConversion::inches_to_mm(avg_distance);
        
        // Convert angle to radians
        double theta_rad = unitConversion::degrees_to_radians(imu_angle);
        
        // Calculate position
        Pose2D pose;
        pose.x_mm = distance_mm * cos(theta_rad);
        pose.y_mm = distance_mm * sin(theta_rad);
        pose.theta_degrees = imu_angle;
        
        return pose;
    }
};

void autonomous() {
    OdometryCalculator odom;
    T_Lib::T_Motor left_enc(1), right_enc(2);
    
    printf("Initial: X=%.2f, Y=%.2f, Theta=%.2f\n", 0.0, 0.0, 0.0);
    
    while (true) {
        auto pose = odom.calculatePose(
            (int)left_enc.getPosition(),
            (int)right_enc.getPosition(),
            0.0  // IMU angle
        );
        
        printf("X=%.2f mm, Y=%.2f mm, Theta=%.2f deg\n", 
               pose.x_mm, pose.y_mm, pose.theta_degrees);
        
        pros::delay(50);
    }
}
```

## Quick Reference Table

| Category | Item | Value/Description |
|----------|------|-------------------|
| **Gearsets** | Blue | 600 RPM |
| | Green | 200 RPM |
| | Red | 100 RPM |
| **Brake** | Hold | Active resistance |
| | Brake | Passive brake |
| | Coast | Free spin |
| **Common Wheels** | 4" Traction | 4.0 inches |
| | 4" Omni | 4.201 inches |
| | 3.25" Traction | 3.25 inches |
| | 2" Traction | 2.0 inches |
