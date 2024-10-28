import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final bool isLoading;
  final VoidCallback? onPressed;
  final Color color;
  final Color textColor; // Change this to Color instead of MaterialColor

  const CustomButton({
    super.key,
    required this.text,
    this.isLoading = false,
    this.onPressed,
    this.color = Colors.blue,
    required this.textColor, // Correctly assign this parameter
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
      ),
      child: isLoading
          ? CircularProgressIndicator(color: Colors.white)
          : Text(
        text,
        style: TextStyle(color: textColor), // Use textColor here
      ),
    );
  }
}


