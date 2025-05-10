import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../Providers/company_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class SignupCompanyPage extends StatefulWidget {
  const SignupCompanyPage({super.key});

  @override
  _SignupCompanyPageState createState() => _SignupCompanyPageState();
}

class _SignupCompanyPageState extends State<SignupCompanyPage> {
  final _formKey = GlobalKey<FormState>();


  final _companyNameController = TextEditingController();
  final _companyRegNumberController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _isPasswordVisible = false;

  @override
  void dispose() {
    _companyNameController.dispose();
    _companyRegNumberController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<CompanyProvider>(context, listen: false);
    print(authProvider); // If null or error, provider is not available

    return Scaffold(
      appBar: AppBar(
        title: const Text("Company Sign Up"),
        backgroundColor: Colors.white,
        elevation: 1,
        foregroundColor: Colors.black,
      ),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Container(
          color: Colors.white,
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                CustomTextField(
                  controller: _companyNameController,
                  hintText: 'Company Name',
                  icon: Icons.business,
                  validator: (value) => value!.isEmpty ? 'Enter company name' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _companyRegNumberController,
                  hintText: 'Registration Number',
                  icon: Icons.confirmation_number,
                  validator: (value) => value!.isEmpty ? 'Enter registration number' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _emailController,
                  hintText: 'Email',
                  icon: Icons.email,
                  validator: (value) {
                    if (value!.isEmpty) return 'Enter email';
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w]{2,4}$').hasMatch(value)) {
                      return 'Enter a valid email';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _passwordController,
                  hintText: 'Password',
                  obscureText: !_isPasswordVisible,
                  icon: Icons.lock,
                  validator: (value) => value!.isEmpty ? 'Enter password' : null,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                    ),
                    onPressed: () {
                      setState(() {
                        _isPasswordVisible = !_isPasswordVisible;
                      });
                    },
                  ),
                ),
                const SizedBox(height: 20),
                _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : CustomButton(
                  onPressed: () async {
                    if (!_formKey.currentState!.validate()) return;

                    setState(() {
                      _isLoading = true;
                    });

                    try {
                      final result = await authProvider.registerCompany(
                        email: _emailController.text.trim(),
                        password: _passwordController.text.trim(),
                        companyName: _companyNameController.text.trim(),
                        registrationNumber: _companyRegNumberController.text.trim(),
                      );

                      if (result != null) {
                        // Successful registration
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Company registered successfully!'),
                          ),
                        );
                        Navigator.pushReplacementNamed(context, '/login/company');
                      } else {
                        // Registration failed
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('User already exists or registration failed'),
                          ),
                        );
                      }
                    } on FirebaseAuthException catch (e) {
                      // Firebase-specific error handling
                      String errorMsg = e.message ?? 'Authentication error';
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(errorMsg)),
                      );
                    } catch (e) {
                      // Handle any other errors
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error occurred: $e')),
                      );
                    } finally {
                      setState(() {
                        _isLoading = false;
                      });
                    }
                  },
                  text: 'Sign Up',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}











