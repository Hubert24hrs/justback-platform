import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/property_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';
import 'dart:ui';
import '../../core/providers/auth_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<PropertyProvider>().fetchFeaturedProperties();
    });
  }

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final auth = context.read<AuthProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF03050C), // Deep cyber midnight
      drawer: _buildDrawer(context, auth),
      body: Stack(
        children: [
          // Background Neon Elements
          Positioned(
            top: -50,
            right: -50,
            child: _buildGlowOrb(const Color(0xFF00FFCC).withOpacity(0.08), 350),
          ),
          Positioned(
            bottom: 100,
            left: -80,
            child: _buildGlowOrb(const Color(0xFF00BFFF).withOpacity(0.08), 400),
          ),

          SafeArea(
            child: Column(
              children: [
                // Premium Header Section (Booking.com style but futuristic)
                _buildPremiumHeader(context, propertyProvider),

                const SizedBox(height: 20),

                // Content Section
                Expanded(
                  child: propertyProvider.isLoading
                      ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
                      : _buildDiscoveryGrid(propertyProvider),
                ),
              ],
            ),
          ),
          
          // Floating High-Tech Bottom Nav
          Positioned(
            bottom: 24,
            left: 24,
            right: 24,
            child: _buildFuturisticNav(),
          ),
        ],
      ),
    );
  }

  Widget _buildGlowOrb(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color,
            blurRadius: 100,
            spreadRadius: 20,
          ),
        ],
      ),
    );
  }

  Widget _buildPremiumHeader(BuildContext context, PropertyProvider provider) {
    return Container(
      padding: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0E21).withOpacity(0.9),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          // Top Navigation Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Builder(
                  builder: (context) => GestureDetector(
                    onTap: () => Scaffold.of(context).openDrawer(),
                    child: const GlassBox(
                      borderRadius: 12,
                      opacity: 0.1,
                      child: Padding(
                        padding: EdgeInsets.all(10.0),
                        child: Icon(Icons.menu_rounded, color: Colors.white, size: 28),
                      ),
                    ),
                  ),
                ),
                const Text(
                  'JUSTBACK',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 4,
                    fontSize: 20,
                  ),
                ),
                const GlassBox(
                  borderRadius: 12,
                  opacity: 0.1,
                  child: Padding(
                    padding: EdgeInsets.all(10.0),
                    child: Icon(Icons.search_rounded, color: Colors.white, size: 28),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Horizontal Categories with prominent icons
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildIconCategory(
                  context,
                  'Apartment',
                  'Apartment\n(Air BnB Ng)', // Exact match
                  Icons.apartment_rounded,
                  'apartment',
                  provider,
                ),
                _buildIconCategory(
                  context,
                  'Hotel',
                  'Hotel',
                  Icons.hotel_rounded,
                  'hotel',
                  provider,
                ),
                _buildIconCategory(
                  context,
                  'ShortLets',
                  'ShortLets', // Changed casing
                  Icons.flash_on_rounded,
                  'shortlet',
                  provider,
                ),
                _buildIconCategory(
                  context,
                  'Night Life',
                  'Night Life', // Changed to Space and Caps
                  Icons.nightlife_rounded,
                  'nightlife',
                  provider,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconCategory(
    BuildContext context,
    String id,
    String label,
    IconData icon,
    String key,
    PropertyProvider provider,
  ) {
    final isSelected = provider.selectedCategory == key;

    return GestureDetector(
      onTap: () => provider.setCategory(key),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.symmetric(horizontal: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppConstants.primaryColor : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppConstants.primaryColor : Colors.white.withOpacity(0.1),
            width: 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppConstants.primaryColor.withOpacity(0.4),
                    blurRadius: 15,
                    spreadRadius: 2,
                  ),
                ]
              : null,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.black : Colors.white70,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isSelected ? Colors.black : Colors.white54,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiscoveryGrid(PropertyProvider provider) {
    final properties = provider.selectedCategory == 'All' 
        ? provider.discoveryProperties 
        : provider.featuredProperties;

    if (properties.isEmpty) {
      return const Center(child: Text('No results found', style: TextStyle(color: Colors.white54)));
    }

    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: properties.length,
      itemBuilder: (context, index) {
        return PropertyCard3D(property: properties[index]);
      },
    );
  }

  Widget _buildFuturisticNav() {
    return GlassBox(
      borderRadius: 24,
      opacity: 0.15,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildNavItem(Icons.home_filled, true),
            _buildNavItem(Icons.favorite_rounded, false),
            // Middle AI Button Container
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [AppConstants.primaryColor, AppConstants.accentColor],
                ),
              ),
              child: const Icon(Icons.smart_toy_rounded, color: Colors.black, size: 28),
            ),
            _buildNavItem(Icons.chat_bubble_rounded, false),
            _buildNavItem(Icons.person_rounded, false),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, bool isActive) {
    return Icon(
      icon,
      color: isActive ? AppConstants.primaryColor : Colors.white38,
      size: 26,
    );
  }

  Widget _buildDrawer(BuildContext context, AuthProvider auth) {
    return Drawer(
      backgroundColor: const Color(0xFF03050C),
      child: Column(
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppConstants.primaryColor.withOpacity(0.2), Colors.black],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircleAvatar(
                    radius: 35,
                    backgroundColor: AppConstants.primaryColor,
                    child: Icon(Icons.person, size: 40, color: Colors.black),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    auth.currentUser?['firstName'] ?? 'Host Name',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard_rounded, color: Colors.white70),
            title: const Text('Host Dashboard', style: TextStyle(color: Colors.white)),
            onTap: () => Navigator.pushNamed(context, '/host-dashboard'),
          ),
          ListTile(
            leading: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white70),
            title: const Text('Wallet', style: TextStyle(color: Colors.white)),
            onTap: () => Navigator.pushNamed(context, '/wallet'),
          ),
          const Spacer(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.white54),
            title: const Text('Logout', style: TextStyle(color: Colors.white54)),
            onTap: () => auth.logout().then((_) => Navigator.pushReplacementNamed(context, '/login')),
          ),
          const SizedBox(height: 50),
        ],
      ),
    );
  }
}

class PropertyCard3D extends StatefulWidget {
  final dynamic property;
  const PropertyCard3D({Key? key, required this.property}) : super(key: key);

  @override
  State<PropertyCard3D> createState() => _PropertyCard3DState();
}

class _PropertyCard3DState extends State<PropertyCard3D> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(seconds: 4), vsync: this)..repeat(reverse: true);
    _animation = Tween<double>(begin: -0.05, end: 0.05).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _getImageUrl(dynamic property) {
    // Handle both 'imageUrl' (string) and 'images' (array) formats
    if (property['imageUrl'] != null) {
      return property['imageUrl'];
    }
    if (property['images'] != null && property['images'] is List && (property['images'] as List).isNotEmpty) {
      return (property['images'] as List).first.toString();
    }
    // Fallback placeholder
    return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800';
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform(
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001) // perspective
            ..rotateX(_animation.value)
            ..rotateY(_animation.value * -1.5),
          alignment: Alignment.center,
          child: child,
        );
      },
      child: GestureDetector(
        onTap: () => Navigator.pushNamed(context, '/property-details', arguments: widget.property['id']),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.6),
                blurRadius: 15,
                offset: const Offset(0, 10),
              ),
              BoxShadow(
                color: AppConstants.primaryColor.withOpacity(0.05),
                blurRadius: 20,
                spreadRadius: -5,
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // 4K Quality Image
                CachedNetworkImage(
                  imageUrl: _getImageUrl(widget.property),
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(color: Colors.grey[900]),
                  errorWidget: (context, url, error) => const Icon(Icons.error),
                ),
                
                // Futuristic Overlay
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.85),
                      ],
                    ),
                  ),
                ),

                // Price Tag (Glow)
                Positioned(
                  top: 14,
                  right: 14,
                  child: GlassBox(
                    borderRadius: 12,
                    opacity: 0.2,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      child: Text(
                        '₦${(widget.property['pricePerNight'] / 1000).toStringAsFixed(0)}k',
                        style: const TextStyle(
                          color: AppConstants.primaryColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          shadows: [Shadow(color: AppConstants.primaryColor, blurRadius: 10)],
                        ),
                      ),
                    ),
                  ),
                ),

                // Info Section
                Positioned(
                  bottom: 16,
                  left: 16,
                  right: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.property['title'],
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 12, color: Colors.white70),
                          const SizedBox(width: 4),
                          Text(
                            widget.property['city'] ?? 'Nigeria',
                            style: const TextStyle(color: Colors.white70, fontSize: 10),
                          ),
                          const Spacer(),
                          const Icon(Icons.star, size: 12, color: Colors.amber),
                          const SizedBox(width: 2),
                          Text(
                            '${widget.property['rating'] ?? widget.property['averageRating'] ?? 4.5}',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
