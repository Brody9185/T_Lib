# Getting Started with T_Lib

T_Lib is a custom C++ robotics library designed for VEX Robotics platforms. It provides advanced motor control capabilities with features like PID control, slew limiting, and load compensation, built on top of the PROS kernel.

## What is T_Lib?

T_Lib abstracts away complex motor control logic and provides an elegant, high-level API for:

- **Individual Motor Control** (`T_Motor`): Advanced PID control with dual speed constants, load compensation, and anti-stall features
- **Motor Group Management** (`T_MotorGroup`): Unified control of multiple motors with synchronization
- **Utilities**: Unit conversion functions, wheel size constants, and convenient aliases

## Installation

1. Include the T_Lib header in your project:
```cpp
#include "T_Lib/api.hpp"
```

2. Link against the T_Lib library (typically handled by your build system)

## Basic Usage Example

Here's a simple example to get started:

```cpp
#include "main.h"
#include "T_Lib/api.hpp"

void opcontrol() {
    // Create a single motor on port 1
    T_Lib::T_Motor motor(1);
    
    // Set the motor to 50% power
    motor.setTargetPercent(50_perc);
    
    // Read the motor's RPM
    double rpm = motor.getRPM();
    
    // Stop the motor
    motor.stop();
}
```

## Key Components

### T_Motor
The `T_Motor` class provides advanced control over a single V5 motor with:
- Real-time PID-based speed control
- Dual-speed PID constants (low and high speed regimes)
- Slew rate limiting
- Load compensation
- Minimum torque (anti-stall) features
- Background control task for non-blocking operation

### T_MotorGroup
The `T_MotorGroup` class manages multiple `T_Motor` objects:
- Apply control commands to all motors at once
- Set PID constants, brake modes, and compensation settings across the group
- Query average RPM and status across the group

### Utilities
T_Lib utilities provide:
- Accurate wheel size constants for common VEX wheels
- Convenient aliases for PROS enumerations
- Unit conversion helpers (inches ↔ mm, degrees ↔ radians)
- Type-safe percentage values with custom literal operators (`50_perc`)

## Control Modes

T_Lib motors support two primary control modes:

- **RPM Control**: `setTargetRPM(rpm)` - Set a target rotation speed in RPM
- **Percent Power**: `setTargetPercent(percent)` - Set power from 0-100%

Both modes use background PID control for smooth, stable operation.

## Next Steps

- Learn about [T_Motor API](./t-motor.md)
- Explore [T_MotorGroup API](./t-motor-group.md)
- Check out [Utilities](./utilities.md)
- See [Common Patterns](./common-patterns.md) for real-world examples
