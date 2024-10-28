import 'package:flutter/material.dart';
import '../widgets/custom_button.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ProAuth Home'),
        elevation: 4,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // Navigate to settings page
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Background image
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/background.png'), // Ensure correct path
                fit: BoxFit.cover, // Cover the whole screen
              ),
            ),
          ),
          // Gradient overlay
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.4), // Lower opacity to show the image
                  Colors.transparent,
                ],
              ),
            ),
          ),
          // The rest of the content
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Center(
                  child: Column(
                    children: [
                      Image.asset('assets/images/logo.png', height: 50), // Ensure correct path
                      const SizedBox(height: 18),
                      const Text(
                        'Your Trusted Authentication',
                        style: TextStyle(color: Colors.white, fontSize: 18),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: CustomButton(
                    text: 'Login',
                    onPressed: () {
                      Navigator.pushNamed(context, '/login');
                    },
                    color: Colors.blue,
                    textColor: Colors.white, // Specify text color
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: CustomButton(
                    text: 'Sign Up',
                    onPressed: () {
                      Navigator.pushNamed(context, '/signup');
                    },
                    color: Colors.blue,
                    textColor: Colors.white, // Specify text color
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/forgotPassword');
                  },
                  child: const Text(
                    'Forgot Password?',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Checkbox(
                      value: false, // Manage this with state management
                      onChanged: (bool? value) {},
                    ),
                    const Text('Remember Me', style: TextStyle(color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      icon: SizedBox(
                        width: 80, // Adjust the width
                        height: 80, // Adjust the height
                        child: Image.asset('assets/images/google_icon.png'), // Ensure correct path
                      ),
                      onPressed: () {
                        // Google login logic
                      },
                    ),
                    IconButton(
                      icon: SizedBox(
                        width: 80, // Adjust the width
                        height: 80, // Adjust the height
                        child: Image.asset('assets/images/facebook_icon.png'), // Ensure correct path
                      ),
                      onPressed: () {
                        // Facebook login logic
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}



