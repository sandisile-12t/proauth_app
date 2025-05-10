import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:proauth/Models/organ_model.dart';
import 'package:proauth/Screens/dashboard_organ_of_state.dart';

class OrganProfilePage extends StatefulWidget {
  final OrganModel organModel;
  final String role;

  const OrganProfilePage({required this.organModel, required this.role, super.key});

  @override
  _OrganProfilePageState createState() => _OrganProfilePageState();
}

class _OrganProfilePageState extends State<OrganProfilePage> {
  late OrganModel _editableOrgan;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _editableOrgan = widget.organModel;
  }

  void _editOrganDetail(
      BuildContext context,
      String title,
      String currentValue,
      Function(String) onSave,
      ) {
    final controller = TextEditingController(text: currentValue);

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text("Edit $title"),
          content: TextField(
            controller: controller,
            decoration: InputDecoration(labelText: title),
            autofocus: true,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () async {
                setState(() => _isUpdating = true);
                final newValue = controller.text.trim();
                onSave(newValue);
                Navigator.pop(context);
                setState(() => _isUpdating = false);
              },
              child: _isUpdating
                  ? const SizedBox(
                height: 16,
                width: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
                  : const Text("Save"),
            ),
          ],
        );
      },
    );
  }

  void _confirmDeleteAccount() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text('Are you sure you want to delete this account permanently?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              await FirebaseFirestore.instance.collection('organs').doc(_editableOrgan.id).delete();
              await FirebaseAuth.instance.currentUser?.delete();

              if (mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  Widget _buildEditableTile({
    required IconData icon,
    required String label,
    required String value,
    required Function(String) onEdit,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.blueGrey),
      title: Text(label),
      subtitle: Text(value),
      trailing: IconButton(
        icon: const Icon(Icons.edit),
        onPressed: () => _editOrganDetail(context, label, value, onEdit),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFF001F54)),
              child: Text(
                _editableOrgan.organName,
                style: const TextStyle(color: Colors.white, fontSize: 22),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text("Dashboard"),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => DashboardOrganOfState(organModel: _editableOrgan),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_forever),
              title: const Text("Delete Account"),
              onTap: _confirmDeleteAccount,
            ),
          ],
        ),
      ),
      appBar: AppBar(
        title: Text("${_editableOrgan.organName} Profile"),
        backgroundColor: const Color(0xFF001F54),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _editableOrgan.organName,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              _editableOrgan.email ?? '',
              style: const TextStyle(fontSize: 16, color: Colors.black54),
            ),
            const SizedBox(height: 8),
            Text("Role: ${widget.role}", style: const TextStyle(fontSize: 16)),
            const Divider(height: 30),

            _buildEditableTile(
              icon: Icons.business,
              label: "Department",
              value: _editableOrgan.department ?? '',
              onEdit: (newValue) {
                setState(() {
                  _editableOrgan = _editableOrgan.copyWith(department: newValue);
                });
              },
            ),
            _buildEditableTile(
              icon: Icons.email,
              label: "Email",
              value: _editableOrgan.email ?? '',
              onEdit: (newValue) {
                setState(() {
                  _editableOrgan = _editableOrgan.copyWith(email: newValue);
                });
              },
            ),

            const SizedBox(height: 40),
            Center(
              child: ElevatedButton.icon(
                icon: const Icon(Icons.dashboard),
                label: const Text("Go to Dashboard"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF001F54),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DashboardOrganOfState(organModel: _editableOrgan),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}



























