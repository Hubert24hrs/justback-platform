import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/data/nigeria_locations.dart';
import '../../core/providers/property_provider.dart';
import '../../core/services/location_service.dart';

/// Full-screen Google Map search screen for discovering properties
class MapSearchScreen extends StatefulWidget {
  const MapSearchScreen({super.key});

  @override
  State<MapSearchScreen> createState() => _MapSearchScreenState();
}

class _MapSearchScreenState extends State<MapSearchScreen> {
  GoogleMapController? _mapController;
  final Set<Marker> _markers = {};
  bool _isLoading = false;
  bool _showSearchButton = false;
  LatLng _currentCenter = const LatLng(
    NigeriaLocations.centerLatitude,
    NigeriaLocations.centerLongitude,
  );

  // Filter state
  double _maxPrice = 200000;
  int _minBedrooms = 1;
  
  // Selected property for bottom sheet
  Map<String, dynamic>? _selectedProperty;

  @override
  void initState() {
    super.initState();
    _loadInitialProperties();
  }

  Future<void> _loadInitialProperties() async {
    setState(() => _isLoading = true);

    // Try to get user location for initial centering
    final position = await LocationService.getCurrentLocation();
    if (position != null && mounted) {
      setState(() {
        _currentCenter = LatLng(position.latitude, position.longitude);
      });
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(_currentCenter, 12.0),
      );
    }

    await _searchThisArea();
  }

  Future<void> _searchThisArea() async {
    setState(() {
      _isLoading = true;
      _showSearchButton = false;
    });

    try {
      final propertyProvider = Provider.of<PropertyProvider>(context, listen: false);
      
      // Search properties near current map center
      await propertyProvider.searchByRadius(
        _currentCenter.latitude,
        _currentCenter.longitude,
        30, // 30km radius
      );

      _updateMarkers(propertyProvider.searchResults.cast<Map<String, dynamic>>());
    } catch (e) {
      debugPrint('Map search error: $e');
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  void _updateMarkers(List<Map<String, dynamic>> properties) {
    _markers.clear();
    for (final prop in properties) {
      final lat = (prop['latitude'] as num?)?.toDouble();
      final lng = (prop['longitude'] as num?)?.toDouble();
      if (lat == null || lng == null) continue;

      final markerId = MarkerId(prop['id']?.toString() ?? '');
      final price = prop['pricePerNight'] ?? prop['price_per_night'] ?? 0;

      _markers.add(
        Marker(
          markerId: markerId,
          position: LatLng(lat, lng),
          infoWindow: InfoWindow(
            title: prop['title'] ?? 'Property',
            snippet: '₦${_formatPrice(price)}/night',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
          onTap: () {
            setState(() => _selectedProperty = prop);
          },
        ),
      );
    }
    if (mounted) setState(() {});
  }

  String _formatPrice(dynamic price) {
    final num = (price is String) ? double.tryParse(price) ?? 0 : price;
    if (num >= 1000000) return '${(num / 1000000).toStringAsFixed(1)}M';
    if (num >= 1000) return '${(num / 1000).toStringAsFixed(0)}K';
    return num.toString();
  }

  void _onCameraMove(CameraPosition pos) {
    _currentCenter = pos.target;
    if (!_showSearchButton && mounted) {
      setState(() => _showSearchButton = true);
    }
  }

  Future<void> _goToMyLocation() async {
    final position = await LocationService.getCurrentLocation();
    if (position != null && _mapController != null) {
      final latLng = LatLng(position.latitude, position.longitude);
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(latLng, 13.0),
      );
      setState(() {
        _currentCenter = latLng;
        _showSearchButton = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.bgDark,
      body: Stack(
        children: [
          // Google Map
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _currentCenter,
              zoom: NigeriaLocations.defaultZoom,
            ),
            markers: _markers,
            onMapCreated: (controller) => _mapController = controller,
            onCameraMove: _onCameraMove,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
            style: _darkMapStyle,
          ),

          // Top bar with back button and filter chips
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Back + Title row
                  Row(
                    children: [
                      _buildGlassButton(
                        icon: Icons.arrow_back,
                        onTap: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(color: AppConstants.glassWhite),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.search, color: AppConstants.neonGreen, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                'Map Search',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 16,
                                ),
                              ),
                              const Spacer(),
                              if (_markers.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppConstants.neonGreen.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '${_markers.length}',
                                    style: TextStyle(
                                      color: AppConstants.neonGreen,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Filter chips
                  const SizedBox(height: 12),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('Under ₦50K', _maxPrice == 50000, () {
                          setState(() => _maxPrice = _maxPrice == 50000 ? 200000 : 50000);
                        }),
                        const SizedBox(width: 8),
                        _buildFilterChip('2+ Beds', _minBedrooms >= 2, () {
                          setState(() => _minBedrooms = _minBedrooms >= 2 ? 1 : 2);
                        }),
                        const SizedBox(width: 8),
                        _buildFilterChip('3+ Beds', _minBedrooms >= 3, () {
                          setState(() => _minBedrooms = _minBedrooms >= 3 ? 1 : 3);
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // "Search this area" button
          if (_showSearchButton)
            Positioned(
              top: MediaQuery.of(context).padding.top + 130,
              left: 0,
              right: 0,
              child: Center(
                child: GestureDetector(
                  onTap: _searchThisArea,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppConstants.neonGreen,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppConstants.neonGreen.withOpacity(0.4),
                          blurRadius: 15,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.refresh, color: Colors.black, size: 18),
                        SizedBox(width: 6),
                        Text(
                          'Search this area',
                          style: TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // Loading indicator
          if (_isLoading)
            Positioned(
              top: MediaQuery.of(context).padding.top + 130,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(AppConstants.neonGreen),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Searching...',
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Selected property bottom sheet
          if (_selectedProperty != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _buildPropertyCard(_selectedProperty!),
            ),

          // My Location FAB
          Positioned(
            bottom: _selectedProperty != null ? 200 : 24,
            right: 16,
            child: _buildGlassButton(
              icon: Icons.my_location,
              onTap: _goToMyLocation,
              size: 48,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassButton({
    required IconData icon,
    required VoidCallback onTap,
    double size = 44,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.6),
          shape: BoxShape.circle,
          border: Border.all(color: AppConstants.glassWhite),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
            ),
          ],
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: active
              ? AppConstants.neonGreen.withOpacity(0.2)
              : Colors.black.withOpacity(0.6),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? AppConstants.neonGreen : AppConstants.glassWhite,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? AppConstants.neonGreen : Colors.white70,
            fontSize: 13,
            fontWeight: active ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildPropertyCard(Map<String, dynamic> property) {
    final price = property['pricePerNight'] ?? property['price_per_night'] ?? 0;
    final rating = property['averageRating'] ?? property['average_rating'] ?? 0;
    final distance = property['distance'];

    return GestureDetector(
      onTap: () {
        // Navigate to property details
        // Navigator.push(context, MaterialPageRoute(
        //   builder: (_) => PropertyDetailScreen(propertyId: property['id']),
        // ));
      },
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppConstants.bgDark.withOpacity(0.95),
          borderRadius: BorderRadius.circular(AppConstants.cardRadius),
          border: Border.all(color: AppConstants.glassWhite),
          boxShadow: [
            BoxShadow(
              color: AppConstants.neonGreen.withOpacity(0.1),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Row(
              children: [
                // Property image placeholder
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppConstants.glassWhite,
                    borderRadius: BorderRadius.circular(12),
                    gradient: LinearGradient(
                      colors: [
                        AppConstants.neonGreen.withOpacity(0.2),
                        AppConstants.cyberBlue.withOpacity(0.2),
                      ],
                    ),
                  ),
                  child: Icon(Icons.home_rounded, color: AppConstants.neonGreen, size: 36),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        property['title'] ?? 'Property',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.location_on, color: AppConstants.cyberBlue, size: 14),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              '${property['city'] ?? ''}, ${property['state'] ?? ''}',
                              style: TextStyle(color: Colors.white60, fontSize: 13),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            '₦${_formatPrice(price)}',
                            style: TextStyle(
                              color: AppConstants.neonGreen,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '/night',
                            style: TextStyle(color: Colors.white38, fontSize: 13),
                          ),
                          const Spacer(),
                          if (rating > 0) ...[
                            Icon(Icons.star, color: Colors.amber, size: 14),
                            const SizedBox(width: 2),
                            Text(
                              '$rating',
                              style: const TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                          ],
                          if (distance != null) ...[
                            const SizedBox(width: 8),
                            Icon(Icons.near_me, color: AppConstants.cyberBlue, size: 14),
                            const SizedBox(width: 2),
                            Text(
                              LocationService.formatDistance(distance.toDouble()),
                              style: TextStyle(color: AppConstants.cyberBlue, fontSize: 13),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            // Close button
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => setState(() => _selectedProperty = null),
              child: Text(
                'Tap to view details  ·  Swipe to dismiss',
                style: TextStyle(color: Colors.white30, fontSize: 11),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Dark map style for the cyberpunk aesthetic
  static const String _darkMapStyle = '''[
    {"elementType": "geometry", "stylers": [{"color": "#0a0a1a"}]},
    {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]},
    {"elementType": "labels.text.fill", "stylers": [{"color": "#757575"}]},
    {"elementType": "labels.text.stroke", "stylers": [{"color": "#0a0a1a"}]},
    {"featureType": "administrative", "elementType": "geometry", "stylers": [{"color": "#1a1a3a"}]},
    {"featureType": "poi", "elementType": "geometry", "stylers": [{"color": "#111133"}]},
    {"featureType": "road", "elementType": "geometry.fill", "stylers": [{"color": "#1a1a3a"}]},
    {"featureType": "road", "elementType": "geometry.stroke", "stylers": [{"color": "#0d0d2a"}]},
    {"featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#1c1c40"}]},
    {"featureType": "transit", "elementType": "geometry", "stylers": [{"color": "#111133"}]},
    {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#050520"}]}
  ]''';

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
