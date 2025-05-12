import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../Providers/company_provider.dart';
import 'package:proauth/Models/Company_user.dart';
import 'company_dashboard_page.dart';

class LoginCompanyPage extends StatefulWidget {
  const LoginCompanyPage({super.key});

  @override
  _LoginCompanyPageState createState() => _LoginCompanyPageState();
}

class _LoginCompanyPageState extends State<LoginCompanyPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isPasswordVisible = false;

  static const Color customNavy = Color(0xFF001F54);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login - Company", style: TextStyle(color: customNavy)),
        backgroundColor: Colors.white,
        iconTheme: IconThemeData(color: customNavy),
        elevation: 0,
      ),
      body: Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              "",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 30),
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.email, color: customNavy),
                border: OutlineInputBorder(),
                labelStyle: TextStyle(color: Colors.black),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 20),
            TextField(
              controller: _passwordController,
              obscureText: !_isPasswordVisible,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: Icon(Icons.lock, color: customNavy),
                border: OutlineInputBorder(),
                labelStyle: TextStyle(color: Colors.black),
                suffixIcon: IconButton(
                  icon: Icon(
                    _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                    color: customNavy,
                  ),
                  onPressed: () {
                    setState(() {
                      _isPasswordVisible = !_isPasswordVisible;
                    });
                  },
                ),
              ),
            ),
            SizedBox(height: 30),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: customNavy,
                padding: EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onPressed: () async {
                final email = _emailController.text.trim();
                final password = _passwordController.text.trim();

                if (email.isEmpty || password.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Please enter email and password.")),
                  );
                  return;
                }

                try {
                  final result = await Provider.of<CompanyProvider>(context, listen: false)
                      .loginCompany(email: email, password: password);

                  if (result == null) {
                    // Login successful
                    final user = FirebaseAuth.instance.currentUser;
                    if (user == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("User not found.")),
                      );
                      return;
                    }

                    final companyDoc = await FirebaseFirestore.instance
                        .collection('company_users')
                        .doc(user.uid)
                        .get();

                    if (!companyDoc.exists) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("Company record not found.")),
                      );
                      return;
                    }

                    final data = companyDoc.data()!; // ✅ Add this line

                    final company = CompanyUser(
                      id: user.uid,
                      companyName: data['companyName'] ?? 'Company Name',
                      email: user.email ?? 'No Email',
                      industry: data['industry'] ?? 'Unknown',
                      location: data['location'] ?? 'Unknown',
                      registrationNumber: data['registrationNumber'] ?? '',
                      about: data['about'] ?? '', // Safe fallback if null
                    );

                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CompanyDashboardPage(
                          companyId: company.id,
                          registrationNumber: company.registrationNumber,
                        ),

                      ),
                    );
                  } else {
                    // Login failed
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(result)),
                    );
                  }
                } catch (e) {
                  print("Login Exception: ${e.runtimeType} - $e");
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("An error occurred. Please try again.")),
                  );
                }
              },
              child: Text('Login', style: TextStyle(color: Colors.white, fontSize: 16)),
            ),
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Don't have an account? ",
                  style: TextStyle(color: Colors.black),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/signup/company');
                  },
                  child: Text(
                    'Create Account',
                    style: TextStyle(color: customNavy),
                  ),
                ),
              ],
            ),
            Center(
              child: TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/forgot_password');
                },
                child: Text(
                  'Forgot Password?',
                  style: TextStyle(color: customNavy),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}







