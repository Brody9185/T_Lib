# T_Lib Documentation

Welcome to the official documentation for **T_Lib**, a comprehensive C++ robotics library built for VEX Competitions on the PROS kernel.

## What is T_Lib?

T_Lib is a custom library that abstracts complex motor control logic and provides an elegant, production-ready API for controlling VEX V5 motors. Whether you're building a simple robot or a complex competition bot, T_Lib streamlines motor management and provides powerful features out of the box.

## Key Features

### 🎯 Advanced Motor Control
- **Dual-Speed PID**: Separate PID constants for low and high-speed regimes
- **Background Control**: Non-blocking motor control via PROS tasks
- **Load Compensation**: Automatically boost voltage under load
- **Anti-Stall Protection**: Minimum torque to prevent motor stalling
- **Slew Rate Limiting**: Smooth acceleration to prevent wheel slip

### 👥 Motor Grouping
- **Unified Control**: Manage multiple motors as a single unit
- **Synchronized Action**: Apply commands to all motors simultaneously
- **Shared Pointers**: Safe memory management with robust patterns

### 🛠️ Utilities & Helpers
- **Accurate Wheel Constants**: Pre-measured wheel sizes for odometry
- **Unit Conversions**: Inches ↔ mm, Degrees ↔ Radians
- **Type-Safe Percentages**: Custom literal operators (`50_perc`)
- **Convenient Aliases**: Shorter names for PROS enumerations

## Library Structure

```
T_Lib/
├── api.hpp                  # Central include file
├── Motor.hpp                # T_Motor class
├── Motor_Group.hpp          # T_MotorGroup class
└── util.hpp                 # Utilities, constants, helpers
```

## Quick Start

### Include T_Lib

```cpp
#include "T_Lib/api.hpp"
```

### Create and Control a Motor

```cpp
// Create a blue gear motor on port 3
T_Lib::T_Motor motor(3);

// Set to 50% power
motor.setTargetPercent(50);

// Or set a specific RPM
motor.setTargetRPM(300);

// Read current RPM
double current_rpm = motor.getRPM();

// Stop when done
motor.stop();
```

### Control Multiple Motors

```cpp
// Create a motor group from port numbers
T_MotorGroup left_side({1, 2, 3});
T_MotorGroup right_side({4, 5, 6});

// Apply control to all motors at once
left_side.setTargetPercent(75);
right_side.setTargetPercent(75);

// Stop all motors
left_side.stop();
right_side.stop();
```

## Documentation Structure

- **[Getting Started](./getting-started.md)**: Introduction and basic usage
- **[T_Motor API](./t-motor.md)**: Complete T_Motor class reference
- **[T_MotorGroup API](./t-motor-group.md)**: Complete T_MotorGroup class reference
- **[Utilities](./utilities.md)**: Helper functions, constants, and types
- **[Common Patterns](./common-patterns.md)**: Real-world usage examples and best practices

## Common Use Cases

### Tank Drive Robot
```cpp
T_MotorGroup left({1, 2, 3});
T_MotorGroup right({4, 5, 6});

// Arcade drive
left.setTargetPercent(forward + turn);
right.setTargetPercent(forward - turn);
```

### Subsystem Architecture
```cpp
class Intake {
    T_Lib::T_Motor motor;
    void intake() { motor.setTargetRPM(600); }
    void outtake() { motor.setTargetRPM(-600); }
};
```

### Odometry & Kinematics
```cpp
// Use precise wheel constants for accurate distance calculation
double distance = (encoder_counts / 360.0) * M_PI * Wheel_Size::Trac_4in;
```

## Why T_Lib?

| Feature | Standard PROS | T_Lib |
|---------|---|---|
| Single Motor Control | ✓ | ✓ Better |
| PID Tuning | Manual | Dual-speed built-in |
| Motor Groups | Limited | ✓ Full-featured |
| Load Compensation | No | ✓ Yes |
| Anti-Stall | No | ✓ Yes |
| Wheel Constants | Manual | ✓ Pre-measured |
| Type-Safe Units | No | ✓ Yes |

## Performance Considerations

- **Background Control**: Motor control runs in a background task, freeing up your main loop
- **Real-Time Responsiveness**: Commands are applied within 10ms
- **Memory Safe**: Uses `std::shared_ptr` for automatic memory management
- **Efficient**: Minimal overhead, designed for competition performance

## Getting Help

- Check the [Common Patterns](./common-patterns.md) guide for examples
- Review the API documentation for your specific use case
- Use the detailed parameter descriptions and examples in the reference pages

## Version Information

- **T_Lib Version**: 0.0.1 (Beta)
- **Target Platform**: VEX Robotics V5 with PROS Kernel
- **Language Standard**: C++17

## License & Attribution

T_Lib is provided as-is for VEX Robotics competition and educational use.

---

**Ready to get started?** Head over to [Getting Started](./getting-started.md) to learn the basics!
