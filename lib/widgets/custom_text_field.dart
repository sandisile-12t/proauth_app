import 'package:flutter/material.dart';

class CustomTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final bool obscureText;
  final IconData? icon;
  final Widget? suffixIcon;
  final Function(String)? onChanged;
  final FormFieldValidator<String>? validator; // Added validator parameter

  const CustomTextField({
    super.key,
    required this.controller,
    required this.hintText,
    this.obscureText = false,
    this.icon,
    this.suffixIcon,
    this.onChanged,
    this.validator, // Accept validator parameter
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField( // Changed from TextField to TextFormField for validation
      controller: controller,
      obscureText: obscureText,
      decoration: InputDecoration(
        labelText: hintText,
        prefixIcon: icon != null ? Icon(icon) : null,
        suffixIcon: suffixIcon,
        border: OutlineInputBorder(),
      ),
      onChanged: onChanged,
      validator: validator, // Use validator here
    );
  }
}


