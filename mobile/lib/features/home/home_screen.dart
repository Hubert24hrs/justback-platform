import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/property_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/providers/auth_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String _selectedCity = 'Lagos';
  int _selectedNavIndex = 0; // 0=Explore, 1=Search, 2=Events, 3=Saved, 4=Chat, 5=Profile
  late AnimationController _floatController;
  late Animation<double> _floatAnimation;

  final List<String> _cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Enugu', 'Asaba'];

  @override
  void initState() {
    super.initState();
    _floatController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);
    _floatAnimation = Tween<double>(begin: -8, end: 8).animate(
      CurvedAnimation(parent: _floatController, curve: Curves.easeInOut),
    );
    Future.microtask(() {
      if (mounted) context.read<PropertyProvider>().fetchFeaturedProperties();
    });
  }

  @override
  void dispose() {
    _floatController.dispose();
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  // Filter properties by selected city
  List<dynamic> _filterByCity(List<dynamic> properties) {
    return properties.where((p) {
      final city = (p['city'] ?? '').toString().toLowerCase();
      final state = (p['state'] ?? '').toString().toLowerCase();
      final selectedLower = _selectedCity.toLowerCase();
      return city.contains(selectedLower) || state.contains(selectedLower);
    }).toList();
  }

  // Filter for nightlife/events only
  List<dynamic> _filterNightlife(List<dynamic> properties) {
    return properties.where((p) {
      final category = (p['category'] ?? '').toString().toLowerCase();
      return category == 'nightlife' || category == 'events' || category == 'club';
    }).toList();
  }

  void _onNavTap(int index) {
    setState(() {
      _selectedNavIndex = index;
    });

    switch (index) {
      case 0: // Explore - stay on home
        break;
      case 1: // Search - focus search bar
        _searchFocusNode.requestFocus();
        break;
      case 2: // Events - filter to nightlife
        context.read<PropertyProvider>().setCategory('nightlife');
        break;
      case 3: // Saved
        Navigator.pushNamed(context, '/favorites');
        break;
      case 4: // Chat with AI
        Navigator.pushNamed(context, '/ai-call');
        break;
      case 5: // Profile
        Navigator.pushNamed(context, '/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final propertyProvider = context.watch<PropertyProvider>();
    final auth = context.read<AuthProvider>();

    // Get filtered properties based on city and category
    List<dynamic> displayProperties;
    if (_selectedNavIndex == 2) {
      // Events tab - show nightlife only
      displayProperties = _filterNightlife(_filterByCity(propertyProvider.discoveryProperties));
    } else {
      // Normal view - filter by city and category
      final baseProperties = propertyProvider.selectedCategory == 'All' 
          ? propertyProvider.discoveryProperties 
          : propertyProvider.featuredProperties;
      displayProperties = _filterByCity(baseProperties);
    }

    return Scaffold(
      backgroundColor: AppConstants.bgDark,
      drawer: _buildDrawer(context, auth),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Top Section - Brand, Search, City Chips, Categories
            SliverToBoxAdapter(
              child: Column(
                children: [
                  _buildTopSection(context),
                  _buildCityChips(),
                  const SizedBox(height: 16),
                  _buildCategoryIcons(propertyProvider),
                  const SizedBox(height: 20),
                ],
              ),
            ),

            // Properties List (Main Content)
            propertyProvider.isLoading
                ? const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator(color: AppConstants.primaryColor)),
                  )
                : displayProperties.isEmpty
                    ? SliverFillRemaining(
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.search_off, size: 64, color: Colors.white.withValues(alpha: 0.3)),
                              const SizedBox(height: 16),
                              Text(
                                _selectedNavIndex == 2 
                                    ? 'No events in $_selectedCity' 
                                    : 'No properties in $_selectedCity',
                                style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 16),
                              ),
                            ],
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) => _buildLuxuryPropertyCard(displayProperties[index]),
                            childCount: displayProperties.length,
                          ),
                        ),
                      ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  Widget _buildTopSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      child: Column(
        children: [
          // Brand Row: Menu + Logo + Notification + Profile
          Row(
            children: [
              // Menu Button
              Builder(
                builder: (ctx) => GestureDetector(
                  onTap: () => Scaffold.of(ctx).openDrawer(),
                  child: const Icon(Icons.menu_rounded, color: Colors.white, size: 28),
                ),
              ),
              const SizedBox(width: 16),
              
              // Fancy "I Just Got Back" Branding
              Expanded(
                child: ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [Color(0xFFFFD700), Color(0xFFFFA500), Color(0xFFFFD700)],
                    stops: [0.0, 0.5, 1.0],
                  ).createShader(bounds),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'I Just Got Back',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          fontFamily: 'serif',
                          shadows: [
                            Shadow(
                              color: const Color(0xFFFFD700).withValues(alpha: 0.6),
                              blurRadius: 15,
                            ),
                          ],
                        ),
                      ),
                      Text(
                        'EXPERIENCE EXCELLENCE',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                          fontSize: 8,
                          letterSpacing: 3,
                          fontWeight: FontWeight.w300,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Notification Bell - Opens notifications with city events
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/notifications'),
                child: Stack(
                  children: [
                    const Icon(Icons.notifications_outlined, color: Colors.white, size: 26),
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),

              // Profile Avatar - Opens profile
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/profile'),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppConstants.primaryColor, width: 2),
                    image: const DecorationImage(
                      image: NetworkImage('https://i.pravatar.cc/100'),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Search Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: Row(
              children: [
                Icon(Icons.search, color: Colors.white.withValues(alpha: 0.5)),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search penthouses, clubs, hotels...',
                      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 14),
                      border: InputBorder.none,
                    ),
                    onSubmitted: (value) {
                      if (value.isNotEmpty) {
                        Navigator.pushNamed(context, '/search', arguments: {'query': value});
                      }
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppConstants.primaryColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.tune, color: AppConstants.primaryColor, size: 20),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCityChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: _cities.map((city) {
          final isSelected = _selectedCity == city;
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: GestureDetector(
              onTap: () {
                setState(() => _selectedCity = city);
                // Trigger filter update
                context.read<PropertyProvider>().setCategory(
                  context.read<PropertyProvider>().selectedCategory
                );
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? AppConstants.primaryColor : Colors.transparent,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? AppConstants.primaryColor : Colors.white.withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  city,
                  style: TextStyle(
                    color: isSelected ? Colors.black : Colors.white.withValues(alpha: 0.7),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCategoryIcons(PropertyProvider provider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildFloating3DCategoryIcon('Apartment', 'assets/images/icon_apartment.jpg', 'apartment', provider),
          _buildFloating3DCategoryIcon('Hotel', 'assets/images/icon_hotel.jpg', 'hotel', provider),
          _buildFloating3DCategoryIcon('ShortLets', 'assets/images/icon_shortlet.jpg', 'shortlet', provider),
          _buildFloating3DCategoryIcon('Night Life', 'assets/images/icon_nightlife.jpg', 'nightlife', provider),
        ],
      ),
    );
  }

  Widget _buildFloating3DCategoryIcon(String label, String imagePath, String categoryKey, PropertyProvider provider) {
    final isSelected = provider.selectedCategory == categoryKey;

    return AnimatedBuilder(
      animation: _floatAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _floatAnimation.value),
          child: child,
        );
      },
      child: GestureDetector(
        onTap: () => provider.setCategory(categoryKey),
        child: Column(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: isSelected ? AppConstants.primaryColor.withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppConstants.primaryColor : Colors.white.withValues(alpha: 0.1),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isSelected 
                        ? AppConstants.primaryColor.withValues(alpha: 0.4) 
                        : Colors.black.withValues(alpha: 0.5),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                    spreadRadius: isSelected ? 2 : 0,
                  ),
                  if (isSelected)
                    BoxShadow(
                      color: AppConstants.primaryColor.withValues(alpha: 0.2),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: Image.asset(
                  imagePath,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Icon(
                      _getIconForCategory(categoryKey),
                      color: isSelected ? AppConstants.primaryColor : Colors.white70,
                      size: 36,
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppConstants.primaryColor : Colors.white.withValues(alpha: 0.7),
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForCategory(String key) {
    switch (key) {
      case 'apartment': return Icons.apartment_rounded;
      case 'hotel': return Icons.hotel_rounded;
      case 'shortlet': return Icons.home_work_rounded;
      case 'nightlife': return Icons.nightlife_rounded;
      default: return Icons.home_rounded;
    }
  }

  Widget _buildLuxuryPropertyCard(dynamic property) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/property-details', arguments: property['id']),
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        height: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.4),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Background Image
              CachedNetworkImage(
                imageUrl: _getImageUrl(property),
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(color: Colors.grey[900]),
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey[900],
                  child: const Icon(Icons.image, color: Colors.white30, size: 40),
                ),
              ),
              
              // Gradient Overlay
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.85),
                    ],
                    stops: const [0.4, 1.0],
                  ),
                ),
              ),

              // Live Badge (if nightlife)
              if (property['category'] == 'nightlife')
                Positioned(
                  top: 14,
                  left: 14,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.circle, color: Colors.white, size: 8),
                        SizedBox(width: 4),
                        Text('LIVE NOW', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),

              // Rating Badge
              Positioned(
                top: 14,
                right: 14,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 14),
                      const SizedBox(width: 3),
                      Text(
                        '${property['rating'] ?? 4.5}',
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Info
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            property['title'] ?? 'Property',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '₦${_formatPrice(property['pricePerNight'])}',
                          style: const TextStyle(
                            color: AppConstants.primaryColor,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: Colors.white60),
                        const SizedBox(width: 4),
                        Text(
                          '${property['address'] ?? ''}, ${property['city'] ?? 'Lagos'}',
                          style: const TextStyle(color: Colors.white60, fontSize: 12),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      children: _buildPropertyTags(property),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _buildPropertyTags(dynamic property) {
    List<String> tags = [];
    if (property['amenities'] != null && property['amenities'] is List) {
      tags = (property['amenities'] as List).take(3).map((e) => e.toString()).toList();
    } else {
      tags = ['Premium', 'Verified'];
    }

    return tags.map((tag) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
        ),
        child: Text(
          tag,
          style: const TextStyle(color: Colors.white70, fontSize: 10),
        ),
      );
    }).toList();
  }

  String _formatPrice(dynamic price) {
    if (price == null) return '0';
    final num = price is int ? price : int.tryParse(price.toString()) ?? 0;
    if (num >= 1000000) {
      return '${(num / 1000000).toStringAsFixed(1)}M';
    } else if (num >= 1000) {
      return '${(num / 1000).toStringAsFixed(0)},000';
    }
    return num.toString();
  }

  String _getImageUrl(dynamic property) {
    if (property['imageUrl'] != null) return property['imageUrl'];
    if (property['images'] != null && property['images'] is List && (property['images'] as List).isNotEmpty) {
      return (property['images'] as List).first.toString();
    }
    return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800';
  }

  Widget _buildBottomNav(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavIcon(Icons.home_filled, 0, 'Explore'),
          _buildNavIcon(Icons.search, 1, 'Search'),
          _buildNavIcon(Icons.music_note, 2, 'Events'),
          _buildNavIcon(Icons.favorite_border, 3, 'Saved'),
          _buildNavIcon(Icons.chat_bubble_outline, 4, 'Chat'),
          _buildNavIcon(Icons.person_outline, 5, 'Profile'),
        ],
      ),
    );
  }

  Widget _buildNavIcon(IconData icon, int index, String label) {
    final isActive = _selectedNavIndex == index;
    return GestureDetector(
      onTap: () => _onNavTap(index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isActive ? AppConstants.primaryColor : Colors.white38,
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: isActive ? AppConstants.primaryColor : Colors.white38,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, AuthProvider auth) {
    return Drawer(
      backgroundColor: const Color(0xFF0A0A0A),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppConstants.primaryColor.withValues(alpha: 0.3),
                  Colors.black,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Align(
                  alignment: Alignment.topRight,
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.close, color: Colors.white70),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppConstants.primaryColor, width: 2),
                        image: const DecorationImage(
                          image: NetworkImage('https://i.pravatar.cc/100'),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          auth.currentUser?['firstName'] ?? 'Guest User',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          auth.currentUser?['email'] ?? 'guest@ijustgotback.com',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.6),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _buildDrawerItem(Icons.dashboard_rounded, 'Host Dashboard', () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/host-dashboard');
                }),
                _buildDrawerItem(Icons.add_business, 'Add Property', () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/add-property');
                }),
                _buildDrawerItem(Icons.calendar_today, 'My Bookings', () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/my-bookings');
                }),
                _buildDrawerItem(Icons.account_balance_wallet, 'Wallet', () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/wallet');
                }),
                _buildDrawerItem(Icons.smart_toy_rounded, 'AI Voice Assistant', () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/ai-call');
                }),
                const Divider(color: Colors.white12, height: 32),
                _buildDrawerItem(Icons.settings, 'Settings', () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/settings');
                }),
                _buildDrawerItem(Icons.help_outline, 'Help & Support', () {}),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(24),
            child: GestureDetector(
              onTap: () async {
                await auth.logout();
                if (context.mounted) Navigator.pushReplacementNamed(context, '/login');
              },
              child: Row(
                children: [
                  Icon(Icons.logout, color: Colors.white.withValues(alpha: 0.5)),
                  const SizedBox(width: 16),
                  Text(
                    'Logout',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 16),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String label, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70),
      title: Text(label, style: const TextStyle(color: Colors.white70)),
      onTap: onTap,
    );
  }
}
