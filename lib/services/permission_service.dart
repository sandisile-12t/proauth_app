import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:proauth/Models/bid_organ_model.dart';
import 'package:proauth/Screens/post_tender_screen.dart';

Future<bool> hasRole(String role) async {
  final user = FirebaseAuth.instance.currentUser;
  if (user != null) {
    try {
      DocumentSnapshot userDoc = await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        String userRole = userDoc['role'];
        return userRole == role;
      }
    } catch (e) {
      print('Error getting user role: $e');
    }
  }
  return false;
}

Future<bool> checkEditPermission(BuildContext context) async {
  final user = FirebaseAuth.instance.currentUser;
  if (user != null) {
    bool isAdmin = await hasRole('Admin');
    if (!isAdmin) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You do not have permission to edit this form')),
      );
      return false;
    }
    return true;
  }
  return false;
}

void navigateToForm(BuildContext context, BidOrganModel bidOrganModel) {
  checkEditPermission(context).then((hasPermission) {
    if (hasPermission) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PostTenderScreen(bidOrganModel: bidOrganModel),
        ),
      );
    }
  });
}

