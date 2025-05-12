import 'package:flutter/material.dart';
import 'package:proauth/Models/Company_user.dart';
import 'package:proauth/Screens/company_dashboard_page.dart';
import 'package:provider/provider.dart';
import 'package:proauth/Providers/company_provider.dart';

const customNavy = Color(0xFF003366);

class CompanyProfilePage extends StatefulWidget {
  final CompanyUser company;

  const CompanyProfilePage({super.key, required this.company});

  @override
  _CompanyProfilePageState createState() => _CompanyProfilePageState();
}

class _CompanyProfilePageState extends State<CompanyProfilePage> {
  late CompanyUser _editableCompany;

  @override
  void initState() {
    super.initState();
    _editableCompany = widget.company;
  }

  // Function to show dialog for editing company details
  void _editCompanyDetail(BuildContext context, String title,
      String currentValue, Function(String) onSave) {
    TextEditingController controller = TextEditingController(text: currentValue);

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text("Edit $title"),
          content: TextField(
            controller: controller,
            decoration: InputDecoration(labelText: title),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),
            TextButton(
              onPressed: () async {
                String newValue = controller.text;
                if (newValue.isNotEmpty && newValue != currentValue) {
                  onSave(newValue);

                  bool isUpdated = await Provider.of<CompanyProvider>(context, listen: false)
                      .updateCompanyUser(_editableCompany);

                  if (isUpdated) {
                    // ✅ Refetch after update to ensure consistency
                    await Provider.of<CompanyProvider>(context, listen: false)
                        .getCompanyUser(_editableCompany.id);

                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Update successful!')),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Update failed.')),
                    );
                  }
                }
                Navigator.pop(context); // Always close dialog
              },
              child: const Text("Save"),
            ),
          ],
        );
      },
    );
  }

  // Function to handle delete profile
  Future<void> _deleteProfile(BuildContext context) async {
    final confirmation = await showDialog<bool>(
      context: context,
      builder: (_) {
        return AlertDialog(
          title: const Text("Delete Profile"),
          content: const Text("Are you sure you want to delete your company profile? This action cannot be undone."),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text("Delete", style: TextStyle(color: Colors.lightBlue)),
            ),
          ],
        );
      },
    );

    if (confirmation == true) {
      bool isDeleted = await Provider.of<CompanyProvider>(context, listen: false)
          .deleteCompanyUser(_editableCompany.id);

      if (isDeleted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile deleted successfully!')));
        Navigator.pushNamedAndRemoveUntil(context, '/login/company', (route) => false); // Redirect to login page
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to delete the profile.')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_editableCompany.companyName),
        backgroundColor: customNavy,
        actions: [
          IconButton(
            icon: Icon(Icons.delete, color: Colors.white),
            onPressed: () async {
              await _deleteProfile(context);
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'Welcome, ${_editableCompany.companyName}!',
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: customNavy,
              ),
            ),
            const SizedBox(height: 20),
            const Divider(color: Colors.black26),

            // About Company
            _buildListTile(
              context,
              icon: Icons.business,
              title: "About Company",
              subtitle: _editableCompany.about ?? "No description available.",
              onPressed: () {
                _editCompanyDetail(
                  context,
                  "About Company",
                  _editableCompany.about ?? "",
                      (newValue) {
                    setState(() {
                      _editableCompany = _editableCompany.copyWith(about: newValue);
                    });
                  },
                );
              },
            ),

            // Location
            _buildListTile(
              context,
              icon: Icons.location_on,
              title: "Location",
              subtitle: _editableCompany.location,
              onPressed: () {
                _editCompanyDetail(
                  context,
                  "Location",
                  _editableCompany.location,
                      (newValue) {
                    setState(() {
                      _editableCompany = _editableCompany.copyWith(location: newValue);
                    });
                  },
                );
              },
            ),

            // Industry
            _buildListTile(
              context,
              icon: Icons.info,
              title: "Industry",
              subtitle: _editableCompany.industry,
              onPressed: () {
                _editCompanyDetail(
                  context,
                  "Industry",
                  _editableCompany.industry,
                      (newValue) {
                    setState(() {
                      _editableCompany = _editableCompany.copyWith(industry: newValue);
                    });
                  },
                );
              },
            ),

            const Divider(color: Colors.black26),

            // Email
            _buildListTile(
              context,
              icon: Icons.email,
              title: "Email",
              subtitle: _editableCompany.email,
            ),

            // Registration Number
            _buildListTile(
              context,
              icon: Icons.confirmation_number,
              title: "Registration Number",
              subtitle: _editableCompany.registrationNumber,
            ),

            const Spacer(),
       ]
        )
      ),
    );
  }

  // Helper method to build ListTile
  Widget _buildListTile(
      BuildContext context, {
        required IconData icon,
        required String title,
        required String subtitle,
        VoidCallback? onPressed,
      }) {
    return ListTile(
      leading: Icon(icon, color: customNavy),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: onPressed != null
          ? IconButton(
        icon: const Icon(Icons.edit, color: customNavy),
        onPressed: onPressed,
      )
          : null,
    );
  }
}

















