import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../Screens/view_tender_screen.dart';
import '../Screens/interaction_history_page.dart';
import '../Screens/company_profile_page.dart';
import '../Models/Company_user.dart';
import '../Providers/company_provider.dart';

class CompanyDashboardPage extends StatelessWidget {
  final String companyId;
  final String registrationNumber;

  const CompanyDashboardPage({
    super.key,
    required this.companyId,
    required this.registrationNumber,
  });

  static const Color primaryColor = Color(0xFF001F54);

  @override
  Widget build(BuildContext context) {
    final companyProvider = Provider.of<CompanyProvider>(context);
    final company = companyProvider.currentCompanyUser;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text(
          "Dashboard",
          style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: primaryColor),
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () => _showLogoutDialog(context),
          ),
        ],
      ),
      body: company == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCompanyHeader(company),
            const SizedBox(height: 24),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.1,
              children: [
                _buildDashboardCard(
                  context,
                  title: "Available Tenders",
                  icon: Icons.visibility,
                  color: Colors.blue,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ViewTenderScreen(companyId: companyId),
                    ),
                  ),
                ),
                _buildDashboardCard(
                  context,
                  title: "Interaction History",
                  icon: Icons.history,
                  color: Colors.orange,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => InteractionHistoryScreen(
                        userId: companyId,
                        role: 'company',
                      ),
                    ),
                  ),
                ),
                _buildDashboardCard(
                  context,
                  title: "Company Profile",
                  icon: Icons.account_circle,
                  color: Colors.green,
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/companyProfile',
                    arguments: company,
                  ),
                ),
                _buildDashboardCard(
                  context,
                  title: "Company Details",
                  icon: Icons.info_outline,
                  color: Colors.purple,
                  onTap: () => _showCompanyDetails(context, company),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompanyHeader(CompanyUser company) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Welcome, ${company.companyName}",
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: primaryColor,
          ),
        ),
      ],
    );
  }


  Widget _buildDashboardCard(
      BuildContext context, {
        required String title,
        required IconData icon,
        required Color color,
        required VoidCallback onTap,
      }) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: color.withOpacity(0.1),
          ),
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 34, color: color),
              const SizedBox(height: 10),
              Text(
                title,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCompanyDetails(BuildContext context, CompanyUser company) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Company Details"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Name: ${company.companyName}"),
            Text("Industry: ${company.industry}"),
            Text("Location: ${company.location}"),
            Text("About: ${company.about?.isNotEmpty == true ? company.about! : 'Not provided'}"),
            Text("Registration No: ${company.registrationNumber}"),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Close"),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Logout"),
        content: const Text("Are you sure you want to log out?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.of(context).pop();
              _logout(context);
            },
            child: const Text("Logout"),
          ),
        ],
      ),
    );
  }

  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    final companyProvider = Provider.of<CompanyProvider>(context, listen: false);
    companyProvider.logout();

    Navigator.pushNamedAndRemoveUntil(context, '/login/company', (route) => false);
  }
}










































