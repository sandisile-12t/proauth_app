import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../Models/custom_user.dart';
import 'package:proauth/Providers/user_provider.dart';
import 'package:provider/provider.dart';
import 'profile_screen.dart';

const Color primaryColor = Color(0xFF002366);
const Color accentColor = Color(0xFFFFD700);

class SignupIndividualPage extends StatefulWidget {
  const SignupIndividualPage({super.key});

  @override
  _SignupIndividualPageState createState() => _SignupIndividualPageState();
}

final FirebaseAuth _auth = FirebaseAuth.instance;
final FirebaseFirestore _firestore = FirebaseFirestore.instance;

Future<CustomUser?> signup(
    String email,
    String password,
    String firstName,
    String lastName,
    String idNumber,
    DateTime? dateOfBirth,
    String qualification,
    BuildContext context,
    ) async {
  if (!RegExp(r'^\d{13}$').hasMatch(idNumber)) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('ID number must be exactly 13 digits.')),
    );
    return null;
  }

  try {
    UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );

    final user = userCredential.user;
    if (user != null) {
      final fullName = '$firstName $lastName';
      await _firestore.collection('users').doc(user.uid).set({
        'fullName': fullName,
        'idNumber': idNumber,
        'dateOfBirth': dateOfBirth?.toIso8601String(),
        'email': email,
        'qualification': qualification,
        'profileComplete': false,
        'role': 'user',
      });

      final customUser = CustomUser(
        id: user.uid,
        name: fullName,
        email: user.email ?? '',
        profileComplete: false,
      );

      Provider.of<UserProvider>(context, listen: false).setUser(customUser);

      return customUser;
    }
  } catch (e, stackTrace) {
    _handleError(context, 'Signup error', '$e\n$stackTrace');
  }
  return null;
}

void _handleError(BuildContext context, String message, String error) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('$message: $error')),
  );
}

class _SignupIndividualPageState extends State<SignupIndividualPage> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isPasswordVisible = false;
  String _email = '';
  String _password = '';
  String _firstName = '';
  String _lastName = '';
  String _idNumber = '';
  DateTime? _dateOfBirth;
  String _selectedQualification = '';

  final List<String> _qualifications = [
    'Quantity Surveyor',
    'Architect',
    'Civil Engineer',
    'Mechanical Engineer',
    'Electrical Engineer',
    'Structural Engineer',
  ];

  void _registerUser() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      try {
        final customUser = await signup(
          _email,
          _password,
          _firstName,
          _lastName,
          _idNumber,
          _dateOfBirth,
          _selectedQualification,
          context,
        );

        setState(() => _isLoading = false);

        if (customUser != null) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(
              builder: (context) => ProfileScreen(userInfo: {
                'fullName': '$_firstName $_lastName',
                'email': _email,
                'idNumber': _idNumber,
                'dateOfBirth': _dateOfBirth.toString(),
                'qualification': _selectedQualification,
              }),
            ),
                (Route<dynamic> route) => false,
          );
        }
      } catch (e) {
        setState(() => _isLoading = false);
        _handleError(context, 'Registration Error', e.toString());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Sign Up', style: TextStyle(color: primaryColor)),
        backgroundColor: Colors.white,
        iconTheme: IconThemeData(color: primaryColor),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text("Create Your Account", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: primaryColor)),
              SizedBox(height: 20),
              _buildTextField("First Name", (value) => _firstName = value, label: 'First Name', onChanged: (value) => _firstName = value),
              _buildTextField("Last Name", (value) => _lastName = value, label: 'Last Name', onChanged: (value) => _lastName = value),
              _buildTextField("Email", (value) => _email = value, isEmail: true, label: 'Email', onChanged: (value) => _email = value),
              _buildPasswordField(),
              _buildTextField("ID Number", (value) => _idNumber = value, label: 'ID Number', onChanged: (value) => _idNumber = value),
              _buildDatePicker(),
              DropdownButtonFormField<String>(
                decoration: InputDecoration(labelText: 'Qualification', labelStyle: TextStyle(color: primaryColor)),
                items: _qualifications.map((qualification) => DropdownMenuItem(value: qualification, child: Text(qualification))).toList(),
                onChanged: (value) => setState(() => _selectedQualification = value ?? ''),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _isLoading ? null : _registerUser,
                style: ElevatedButton.styleFrom(backgroundColor: accentColor),
                child: _isLoading ? CircularProgressIndicator() : Text('Register', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
      String s,
      Function(dynamic value) param1, {
        required String label,
        required Function(String) onChanged,
        bool isEmail = false,
      }) {
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: primaryColor),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your $label';
        }
        if (isEmail && !RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      },
      onChanged: onChanged,
    );
  }

  Widget _buildPasswordField() {
    return TextFormField(
      obscureText: !_isPasswordVisible,
      decoration: InputDecoration(
        labelText: 'Password',
        labelStyle: TextStyle(color: primaryColor),
        suffixIcon: IconButton(
          icon: Icon(
            _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
            color: primaryColor,
          ),
          onPressed: () {
            setState(() {
              _isPasswordVisible = !_isPasswordVisible;
            });
          },
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter a password';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        return null;
      },
      onChanged: (value) => _password = value,
    );
  }

  Widget _buildDatePicker() {
    return GestureDetector(
      onTap: () async {
        DateTime? pickedDate = await showDatePicker(
          context: context,
          initialDate: DateTime.now(),
          firstDate: DateTime(1900),
          lastDate: DateTime.now(),
        );
        setState(() => _dateOfBirth = pickedDate);
      },
      child: InputDecorator(
        decoration: InputDecoration(labelText: 'Date of Birth'),
        child: Text(_dateOfBirth != null ? _dateOfBirth!.toLocal().toString().split(' ')[0] : 'Pick a Date'),
      ),
    );
  }
}




