import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:provider/provider.dart'; // <-- Add this
import '../Models/organ_model.dart';
import '../Providers/organ_of_state_provider.dart'; // <-- Ensure this import points to your OrganProvider

class LoginOrganOfState extends StatefulWidget {
  static const Color customNavy = Color(0xFF001F54);

  const LoginOrganOfState({super.key});

  @override
  _LoginOrganOfStateState createState() => _LoginOrganOfStateState();
}

class _LoginOrganOfStateState extends State<LoginOrganOfState> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading = false;

  InputDecoration _buildInputDecoration(String label, IconData icon, {Widget? suffixIcon}) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: LoginOrganOfState.customNavy),
      suffixIcon: suffixIcon,
      border: const OutlineInputBorder(),
    );
  }

  Future<void> _loginUser(BuildContext context) async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter both email and password.")),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Sign in with Firebase Auth
      UserCredential userCredential = await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      String userId = userCredential.user?.uid ?? '';

      if (userId.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("User ID is not available.")),
        );
        return;
      }

      // Fetch organ user data
      DocumentSnapshot organUserSnapshot = await FirebaseFirestore.instance
          .collection('organs')
          .doc(userId)
          .get();

      if (organUserSnapshot.exists && organUserSnapshot.data() != null) {
        OrganModel organModel = OrganModel.fromMap(
          organUserSnapshot.data() as Map<String, dynamic>,
          organUserSnapshot.id,
        );

        // Set in OrganProvider
        Provider.of<OrganProvider>(context, listen: false).setOrganUser(organModel);

        // Navigate to dashboard
        Navigator.pushReplacementNamed(context, '/organ_dashboard');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Organ user data not found.")),
        );
      }
    } on FirebaseAuthException catch (e) {
      String errorMessage;
      switch (e.code) {
        case 'user-not-found':
          errorMessage = "No user found with this email.";
          break;
        case 'wrong-password':
          errorMessage = "Incorrect password.";
          break;
        default:
          errorMessage = e.message ?? "An error occurred.";
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMessage)));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("An unexpected error occurred: $e")),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Login - Organ of State",
          style: TextStyle(color: LoginOrganOfState.customNavy),
        ),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: LoginOrganOfState.customNavy),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 30),
            TextField(
              controller: _emailController,
              decoration: _buildInputDecoration('Email', Icons.email),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: _buildInputDecoration(
                'Password',
                Icons.lock,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    color: LoginOrganOfState.customNavy,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                ),
              ),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: LoginOrganOfState.customNavy,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onPressed: _isLoading ? null : () => _loginUser(context),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                'Login',
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Don't have an account? "),
                TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/signup/organ_of_state');
                  },
                  child: const Text(
                    'Create Account',
                    style: TextStyle(color: LoginOrganOfState.customNavy),
                  ),
                ),
              ],
            ),
            Center(
              child: TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/forgot_password');
                },
                child: const Text(
                  'Forgot Password?',
                  style: TextStyle(color: LoginOrganOfState.customNavy),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}













