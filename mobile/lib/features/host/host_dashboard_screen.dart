import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/host_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';

class HostDashboardScreen extends StatefulWidget {
  const HostDashboardScreen({Key? key}) : super(key: key);

  @override
  State<HostDashboardScreen> createState() => _HostDashboardScreenState();
}

class _HostDashboardScreenState extends State<HostDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<HostProvider>().fetchHostDashboard());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      appBar: AppBar(
        title: const Text('Host Dashboard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Consumer<HostProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor));
          }

          final stats = provider.hostStats;

          return RefreshIndicator(
            onRefresh: provider.fetchHostDashboard,
            color: AppConstants.primaryColor,
            backgroundColor: const Color(0xFF1A1D2D),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Neon Earnings Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      gradient: LinearGradient(
                        colors: [
                          AppConstants.primaryColor.withOpacity(0.9),
                          AppConstants.cyberBlue.withOpacity(0.7),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppConstants.primaryColor.withOpacity(0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Total Earnings',
                              style: TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.w600),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Row(
                                children: [
                                  Text('This Month', style: TextStyle(color: Colors.black, fontSize: 12, fontWeight: FontWeight.bold)),
                                  Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: Colors.black),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          '₦${stats?['totalEarnings'] ?? 0}',
                          style: const TextStyle(
                            color: Colors.black,
                            fontSize: 40,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -1,
                          ),
                        ),
                        const SizedBox(height: 16),
                         Row(
                           children: [
                             Container(
                               padding: const EdgeInsets.all(4),
                               decoration: const BoxDecoration(
                                 color: Colors.black,
                                 shape: BoxShape.circle,
                               ),
                               child: const Icon(Icons.arrow_upward_rounded, color: AppConstants.primaryColor, size: 14),
                             ),
                             const SizedBox(width: 8),
                             const Text(
                               '+12% from last month',
                               style: TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.w500),
                             ),
                           ],
                         ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // 2. Glass Stats Grid
                  Row(
                    children: [
                      _buildGlassStatBox(
                        'Total Views',
                        '${stats?['totalViews'] ?? 0}',
                        Icons.visibility_outlined,
                        Colors.purpleAccent,
                      ),
                      const SizedBox(width: 16),
                      _buildGlassStatBox(
                        'Rating',
                        '${stats?['rating'] ?? 0}',
                        Icons.star_rounded,
                        Colors.amberAccent,
                      ),
                    ],
                  ),
                   const SizedBox(height: 16),
                  Row(
                    children: [
                       _buildGlassStatBox(
                        'Bookings',
                        '12',
                        Icons.bookmark_border_rounded,
                        AppConstants.primaryColor,
                      ),
                      const SizedBox(width: 16),
                      _buildGlassStatBox(
                        'Response',
                        '98%',
                        Icons.chat_bubble_outline_rounded,
                        AppConstants.cyberBlue,
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),
                  
                  // 3. Recent Activity Header
                  const Text(
                    'Recent Activity',
                     style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5),
                  ),
                   const SizedBox(height: 16),
                   
                   _buildRecentActivityItem('New Booking', 'John Doe booked "Luxury Villa"', '2m ago', AppConstants.primaryColor),
                   _buildRecentActivityItem('Review', 'Sarah left a 5-star review', '2h ago', Colors.amber),
                   _buildRecentActivityItem('Payment', 'Payout of ₦45,000 processed', '1d ago', AppConstants.cyberBlue),
                  
                  const SizedBox(height: 32),

                  // 4. Your Listings Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Your Listings',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5),
                      ),
                      TextButton.icon(
                        onPressed: () => Navigator.pushNamed(context, '/add-property'),
                        icon: const Icon(Icons.add_rounded, color: AppConstants.primaryColor),
                        label: const Text('Add New', style: TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold)),
                        style: TextButton.styleFrom(
                          backgroundColor: AppConstants.primaryColor.withOpacity(0.1),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  if (provider.myListings.isEmpty)
                    GlassBox(
                      opacity: 0.05,
                      borderRadius: 20,
                      child: Padding(
                        padding: const EdgeInsets.all(40),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.house_siding_rounded, size: 48, color: Colors.white.withOpacity(0.2)),
                              const SizedBox(height: 16),
                              const Text(
                                'No listings yet',
                                style: TextStyle(color: Colors.white54, fontSize: 16),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Create your first property listing to start earning.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Colors.white38, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: provider.myListings.length,
                      itemBuilder: (context, index) {
                        return _buildListingItem(provider.myListings[index]);
                      },
                    ),

                  const SizedBox(height: 80),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildGlassStatBox(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: GlassBox(
        opacity: 0.05,
        borderRadius: 20,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(height: 16),
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Colors.white)),
              const SizedBox(height: 4),
              Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildRecentActivityItem(String title, String subtitle, String time, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: color.withOpacity(0.5), blurRadius: 6)]),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 14)),
              ],
            ),
          ),
          Text(time, style: const TextStyle(color: Colors.white38, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildListingItem(dynamic property) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        color: const Color(0xFF0F111A),
      ),
      child: Column(
        children: [
          // Image Top
          Container(
            height: 140,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              image: property['imageUrl'] != null
                  ? DecorationImage(image: NetworkImage(property['imageUrl']), fit: BoxFit.cover)
                  : null,
              color: Colors.grey[900],
            ),
            child: property['imageUrl'] == null
                ? const Center(child: Icon(Icons.image_not_supported_rounded, color: Colors.white24))
                : Stack(
                  children: [
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppConstants.primaryColor.withOpacity(0.5)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.circle, color: AppConstants.primaryColor, size: 8),
                            SizedBox(width: 6),
                            Text('Active', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    )
                  ],
                ),
          ),
          
          // Content Bottom
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        property['title'],
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${property['city']}, ${property['state']}',
                        style: const TextStyle(color: Colors.white54, fontSize: 13),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '₦${property['basePrice']} / night',
                         style: const TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.edit_note_rounded, color: Colors.white),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(0.1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
