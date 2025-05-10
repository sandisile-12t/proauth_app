import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final VoidCallback onPressed;
  final String text;
  final Color? textColor; // Add textColor parameter

  // Define your colors as constants outside the constructor
  static const Color primaryColor = Color(0xFF002366); // Navy color
  static const Color accentColor = Color(0xFFFFD700); // Yellow color

  const CustomButton({
    required this.onPressed,
    required this.text,
    this.textColor,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor, // Use primaryColor for the button's background
        foregroundColor: accentColor, // Use accentColor for text if needed
      ),
      child: Text(
        text,
        style: TextStyle(color: textColor ?? Colors.white), // Use textColor
      ),
    );
  }
}
