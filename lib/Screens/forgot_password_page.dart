import 'package:flutter/material.dart';

class ForgotPasswordPage extends StatelessWidget {
  final _emailController = TextEditingController();

  // Define a custom navy color
  static const Color customNavy = Color(0xFF001F54);

  ForgotPasswordPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Forgot Password",
          style: TextStyle(color: Colors.black), // White text for the AppBar
        ),
        backgroundColor: Colors.white, // Yellow color for the AppBar
        elevation: 0, // Removes the shadow under the AppBar
      ),
      body: Container(
        color: Colors.white, // Set background to white
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Title text
            Text(
              "Reset your password",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black, // Black text color
              ),
            ),
            SizedBox(height: 20),
            // Email input field
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Enter your email',
                labelStyle: TextStyle(color: Colors.black), // Black label color
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: customNavy), // Custom navy border
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black), // Black border
                ),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 20),
            // Reset Password button
            ElevatedButton(
              onPressed: () {
                // Logic for password reset
                print("Reset password for ${_emailController.text}");
                // Show confirmation message
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: customNavy, // Custom navy color for the button
              ),
              child: Text(
                'Reset Password',
                style: TextStyle(color: Colors.white), // White text on button
              ),
            ),
          ],
        ),
      ),
    );
  }
}

