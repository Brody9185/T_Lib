# FAQ & Troubleshooting

## Frequently Asked Questions

### General Questions

#### Q: What's the difference between T_Motor and PROS Motor?
**A:** T_Motor is a wrapper around PROS motors that adds:
- Background PID control for smooth speed regulation
- Dual-speed PID constants (separate low/high speed tuning)
- Load compensation (automatic voltage boost under load)
- Minimum torque (anti-stall protection)
- Non-blocking control via background tasks

PROS Motor is lower-level and requires manual voltage controls.

#### Q: Can I mix T_Lib motors with regular PROS motors?
**A:** Yes! T_Lib motors are compatible with regular PROS code. However, for synchronized control (like a drivetrain), use T_MotorGroup instead of mixing approaches.

#### Q: Do I need to configure motors every time I create one?
**A:** No, but it's recommended. Default settings are conservative (safe), but you'll get better performance by tuning PID constants and enabling features like load compensation.

#### Q: What's the difference between `setTargetRPM()` and `setTargetPercent()`?
**A:** 
- `setTargetRPM()`: Sets an absolute RPM target (e.g., 600 RPM). Better for consistent operation regardless of battery voltage.
- `setTargetPercent()`: Sets power as a percentage (0-100%). Better for proportional control (like joystick input).

#### Q: How often should I call motor control methods?
**A:** Call them in your main control loop (usually every 20ms). The motor control task runs in the background, so commands are processed continuously.

---

## Troubleshooting

### Motors Not Moving

#### Symptom: Motor doesn't respond to commands
**Solutions:**
1. Check port number is correct (1-21)
2. Verify motor is physically connected
3. Check firmware is up to date
4. Confirm motor brake mode isn't preventing movement

```cpp
// Debug: Check motor status
printf("RPM: %f, Voltage: %d, Temp: %f\n", 
       motor.getRPM(), motor.getVoltage(), motor.getTemperature());
```

#### Symptom: Motor reverses unexpectedly
**Solutions:**
1. Check if motor was created with `reversed = true`:
```cpp
T_Lib::T_Motor motor(1, T_Lib::util::Aliases::Blue, true);  // true = reversed
```

2. Check `setReversed()` wasn't called on that motor:
```cpp
motor.setReversed(false);
```

---

### PID & Speed Control Issues

#### Symptom: Motor oscillates around target RPM
**Solution:** PID constants are too aggressive. Reduce `kp` (proportional gain):
```cpp
// Too aggressive
motor.setLowConstants(0.05, 0.5);    // kp too high

// Better
motor.setLowConstants(0.05, 0.1);    // Reduced kp
```

#### Symptom: Motor is slow to reach target RPM
**Solution:** Increase `kv` (feedforward gain) or `kp`:
```cpp
// Slow response
motor.setLowConstants(0.01, 0.01);

// Better response
motor.setLowConstants(0.05, 0.1);
```

#### Symptom: PID tuning changes don't take effect
**Solution:** Ensure PID is enabled:
```cpp
// Check if PID is enabled
if (!motor.isPIDEnabled()) {
    motor.setPIDEnabled(true);
}
```

#### Symptom: Motor stops unexpectedly
**Solution:** 
1. Check if minimum torque is limiting the motor:
```cpp
if (motor.isMinTorqueEnabled()) {
    motor.setMinTorque(false);
}
```

2. Check temperature throttling:
```cpp
double temp = motor.getTemperature();
printf("Temperature: %f C\n", temp);  // Motors throttle above ~70C
```

---

### Motor Group Issues

#### Symptom: Motor group commands don't apply to all motors
**Solution:** Verify motors were added correctly:
```cpp
T_MotorGroup group({1, 2, 3});
printf("Group size: %zu\n", group.size());  // Should print 3

// Verify motors are actually controlled
for (const auto& m : group.getMotors()) {
    m->setTargetRPM(600);  // Direct control
}
```

#### Symptom: Motors in group are out of sync
**Solution:**
1. Check if all motors have identical PID constants:
```cpp
group.setDualConstants(0.05, 0.1, 0.05, 0.05);  // All same
```

2. Check encoder values are similar:
```cpp
for (const auto& m : group.getMotors()) {
    printf("Position: %f\n", m->getPosition());
}
```

3. Use load compensation to handle gear differences:
```cpp
group.setLoadCompensation(true, 5.0);
```

---

### Performance & Thermal Issues

#### Symptom: Motors getting too hot
**Solutions:**
1. Reduce continuous power:
```cpp
motor.setTargetPercent(50);  // Instead of 100
```

2. Add duty cycle (on/off periods):
```cpp
if (time_ms % 2000 < 1000) {  // On for 1s, off for 1s
    motor.setTargetRPM(600);
} else {
    motor.stop();
}
```

3. Check for mechanical jams:
```cpp
// High voltage + low RPM = jammed
if (motor.getVoltage() > 11000 && motor.getRPM() < 100) {
    printf("Motor may be jammed!\n");
    motor.stop();
}
```

#### Symptom: Voltage limit being reached
**Solution:** Check your robot's battery voltage and disable other power draws:
```cpp
int voltage = motor.getVoltage();
int limit = motor.getVoltageLimit();
printf("Voltage: %d / %d mV\n", voltage, limit);
```

---

### Initialization Issues

#### Symptom: Program crashes on startup
**Solutions:**
1. Create motors after `initialize()`:
```cpp
void initialize() { }  // Empty is fine

void opcontrol() {
    T_Lib::T_Motor motor(1);  // Create here, not in initialize
}
```

2. Verify port numbers are valid (1-21)

3. Use proper include:
```cpp
#include "T_Lib/api.hpp"  // Correct
// #include "T_Lib/Motor.hpp"  // Wrong, use api.hpp
```

#### Symptom: Undefined reference to T_Lib
**Solution:** Add T_Lib to your build configuration. Check your `Makefile` or build system includes the T_Lib library.

---

### Compilation Issues

#### Error: "T_Lib/api.hpp: No such file or directory"
**Solution:** 
1. Verify T_Lib is in the `include/` directory
2. Verify directory structure:
```
include/
└── T_Lib/
    ├── api.hpp
    ├── Motor.hpp
    ├── Motor_Group.hpp
    └── util.hpp
```

#### Error: "undefined reference to 'T_Lib::T_Motor::...'"
**Solution:** Ensure T_Lib source files are being compiled and linked. Check your build configuration.

---

## Debug Tips

### Comprehensive Motor Diagnostics
```cpp
void diagnosticReport(T_Lib::T_Motor& motor, const char* name) {
    printf("\n=== %s Diagnostics ===\n", name);
    printf("RPM: %.2f / %.2f (target)\n", motor.getRPM(), motor.getTargetRPM());
    printf("Voltage: %d mV (limit: %d)\n", motor.getVoltage(), motor.getVoltageLimit());
    printf("Temperature: %.1f C\n", motor.getTemperature());
    printf("Position: %.0f\n", motor.getPosition());
    printf("Spinning: %s (raw: %s)\n", 
           motor.isSpinning() ? "Yes" : "No",
           motor.isSpinningRaw() ? "Yes" : "No");
    printf("PID: %s\n", motor.isPIDEnabled() ? "Enabled" : "Disabled");
    printf("Reversed: %s\n", motor.isReversed() ? "Yes" : "No");
    printf("Brake: ");
    // Print brake mode
    printf("\n");
}
```

### Motor Group Health Check
```cpp
void healthCheck(T_MotorGroup& group, const char* name) {
    printf("\n=== %s Health Check ===\n", name);
    printf("Motors: %zu\n", group.size());
    printf("Average RPM: %.2f\n", group.getAverageRPM());
    printf("Any Spinning: %s\n", group.isAnySpinning() ? "Yes" : "No");
    
    for (size_t i = 0; i < group.getMotors().size(); ++i) {
        auto& m = group.getMotors()[i];
        printf("  [%zu] RPM: %.0f | Temp: %.1f C | Voltage: %d mV\n",
               i, m->getRPM(), m->getTemperature(), m->getVoltage());
    }
}
```

---

## Common Best Practices

### ✅ DO:
- ✓ Configure motors during initialization
- ✓ Use motor groups for coordinated control
- ✓ Enable load compensation for heavy-load scenarios
- ✓ Monitor temperature and voltage
- ✓ Use meaningful variable names (left_motors, intake, etc.)
- ✓ Test PID constants on the actual robot

### ❌ DON'T:
- ✗ Create motors repeatedly in loops
- ✗ Mix control methods (don't use both PROS and T_Lib on same motor)
- ✗ Ignore temperature warnings
- ✗ Set contradictory configurations (e.g., enable both slew and high ki)
- ✗ Assume default settings are optimal for your use case
- ✗ Forget to include the main header file

---

## Still Having Issues?

1. **Check the API Documentation**: Review [T_Motor](./t-motor.md) or [T_MotorGroup](./t-motor-group.md)
2. **Review Examples**: See [Common Patterns](./common-patterns.md) for working code
3. **Enable Debug Output**: Print motor status continuously
4. **Test Isolation**: Test a single motor before building complex systems
5. **Consult Example Project**: Check the T_Lib Example Project source code

---

## Performance Tuning Guide

### For a Drivetrain
```cpp
// Start conservative
motor.setDualConstants(
    0.05, 0.05,  // Low: kv, kp
    0.05, 0.05   // High: kv, kp
);

// If too slow to reach target:
motor.setDualConstants(
    0.05, 0.15,  // Increase kp
    0.05, 0.10
);

// If oscillates:
motor.setDualConstants(
    0.05, 0.05,  // Decrease kp
    0.05, 0.03
);
```

### For Heavy Loads
```cpp
motor.setLoadCompensation(true, 6.0, 20);  // Aggressive boost
motor.setMinTorque(true, 1500, 800);       // Higher minimum voltage
```

### For Precision (Intake, Catapult)
```cpp
motor.setDualConstants(
    0.05, 0.15, 0.005, 0.10,  // Add integral and derivative
    0.05, 0.10, 0.002, 0.05
);
motor.setSlewLimitEnabled(false);  // Allow fast acceleration
```
