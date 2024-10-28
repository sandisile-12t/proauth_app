import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class SignUpIndividualPage extends StatelessWidget {
  const SignUpIndividualPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Individual Sign Up'),
      ),
      body: Center(
        child: Text('Welcome to the Individual Sign Up Page!'),
      ),
    );
  }
}
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed; // Allow nullable onPressed
  final Color color;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
      ), // This can be null
      child: Text(text),
    );
  }
}

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  _SignUpPageState createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  final _formKey = GlobalKey<FormState>();
  String _selectedRole = 'Individual'; // Default role
  bool _isLoading = false; // State variable for loading indicator

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context); // Fetch auth provider

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign Up'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: _isLoading
            ? Center(child: CircularProgressIndicator())
            : Form(
          key: _formKey,
          child: Column(
            children: [
              const Spacer(),
              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Name',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
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
                  return null;
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
                    return 'Please enter a password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Dropdown for Role Selection
              DropdownButtonFormField<String>(
                value: _selectedRole,
                items: [
                  const DropdownMenuItem(
                    value: 'Individual',
                    child: Text('Individual'),
                  ),
                  const DropdownMenuItem(
                    value: 'Company',
                    child: Text('Company'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedRole = value;
                    });
                  }
                },
                decoration: const InputDecoration(
                  labelText: 'Select Role',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),

              CustomButton(
                text: _isLoading ? 'Registering...' : 'Register as $_selectedRole',
                onPressed: _isLoading
                    ? null // Disable button when loading
                    : () {
                  if (_formKey.currentState!.validate()) {
                    setState(() {
                      _isLoading = true; // Start loading
                    });

                    // Implement registration logic here
                    authProvider.signUp(
                      nameController.text,
                      emailController.text,
                      passwordController.text,
                      _selectedRole,
                    ).then((success) {
                      setState(() {
                        _isLoading = false; // Stop loading
                      });

                      if (success != null) {
                        Navigator.pushReplacementNamed(
                          context,
                          _selectedRole == 'Individual'
                              ? '/userDashboard'
                              : '/companyDashboard',
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Sign up failed')),
                        );
                      }
                    }).catchError((error) {
                      setState(() {
                        _isLoading = false; // Stop loading
                      });
                      // Handle any errors that occur during signup
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error: $error')),
                      );
                    });
                  }
                },
                color: Colors.blue,
              ),


              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}





