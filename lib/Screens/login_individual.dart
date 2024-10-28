import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:proauth/providers/auth_provider.dart';
import 'package:proauth/widgets/custom_button.dart';
import 'package:proauth/screens/routes.dart';

class LoginIndividualPage extends StatefulWidget {
  const LoginIndividualPage({Key? key}) : super(key: key);

  @override
  _LoginIndividualPageState createState() => _LoginIndividualPageState();
}

class _LoginIndividualPageState extends State<LoginIndividualPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool _isCompany = false;
  bool _isLoading = false;

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void _toggleLoginType(bool value) {
    setState(() {
      _isCompany = value;
      // Clear input fields when switching login types
      emailController.clear();
      passwordController.clear();
    });
  }

  Future<void> _login() async {
    setState(() {
      _isLoading = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    try {
      final success = await authProvider.login(
        emailController.text,
        passwordController.text,
        _isCompany ? 'Company' : 'Individual',
      );

      if (success != null) {
        // Navigate based on login type
        Navigator.pushNamed(
          context,
          _isCompany ? Routes.companyDashboard : Routes.userDashboard,
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login failed. Please check your credentials.')),
        );
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $error')),
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
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(),
                Center(
                  child: Text(
                    'Welcome!',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Individual Login'),
                    Switch(
                      value: _isCompany,
                      onChanged: _toggleLoginType,
                    ),
                    const Text('Company Login'),
                  ],
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    }
                    if (!RegExp(r'\S+@\S+\.\S+').hasMatch(value)) {
                      return 'Please enter a valid email address';
                    }
                    return null; // This must return null if validation is successful
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: passwordController,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null; // This must return null if validation is successful
                  },
                ),
                const SizedBox(height: 16),
                CustomButton(
                  text: 'Login',
                  isLoading: _isLoading,
                  onPressed: () {
                    if (_isLoading) return; // Prevent double tap if loading
                    if (_formKey.currentState != null && _formKey.currentState!.validate()) {
                      _login();
                    }
                  },
                  color: Colors.blue,
                  textColor: Colors.white,
                ),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, Routes.forgotPassword);
                  },
                  child: const Text('Forgot Password?'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
























