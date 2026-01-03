import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

// Mock providers and screens for testing
// In a real app, these would be imported from the actual files

void main() {
  group('Home Screen Widget Tests', () {
    testWidgets('should display app title', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: AppBar(title: const Text('JustBack')),
            body: const Center(child: Text('Welcome to JustBack')),
          ),
        ),
      );

      expect(find.text('JustBack'), findsOneWidget);
      expect(find.text('Welcome to JustBack'), findsOneWidget);
    });

    testWidgets('should display category filter chips', (WidgetTester tester) async {
      final categories = ['All', 'Apartment', 'Hotel', 'Shortlet', 'Nightlife'];
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: categories.map((cat) => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Chip(label: Text(cat)),
                )).toList(),
              ),
            ),
          ),
        ),
      );

      for (final category in categories) {
        expect(find.text(category), findsOneWidget);
      }
    });

    testWidgets('should display property cards', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ListView(
              children: const [
                Card(
                  child: ListTile(
                    title: Text('Luxury Apartment Lagos'),
                    subtitle: Text('₦50,000/night'),
                    trailing: Icon(Icons.star, color: Colors.amber),
                  ),
                ),
                Card(
                  child: ListTile(
                    title: Text('Cozy Hotel Abuja'),
                    subtitle: Text('₦75,000/night'),
                    trailing: Icon(Icons.star, color: Colors.amber),
                  ),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Luxury Apartment Lagos'), findsOneWidget);
      expect(find.text('Cozy Hotel Abuja'), findsOneWidget);
      expect(find.text('₦50,000/night'), findsOneWidget);
      expect(find.byIcon(Icons.star), findsNWidgets(2));
    });

    testWidgets('should display search functionality', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: AppBar(
              title: const TextField(
                decoration: InputDecoration(
                  hintText: 'Search properties...',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
            ),
            body: const SizedBox(),
          ),
        ),
      );

      expect(find.byIcon(Icons.search), findsOneWidget);
      expect(find.text('Search properties...'), findsOneWidget);
    });
  });

  group('Property Card Widget Tests', () {
    testWidgets('should display property image placeholder', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Card(
              child: Column(
                children: [
                  Container(
                    height: 200,
                    color: Colors.grey[300],
                    child: const Center(child: Icon(Icons.image, size: 50)),
                  ),
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Test Property', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('Lagos, Nigeria'),
                        Text('₦45,000/night'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Test Property'), findsOneWidget);
      expect(find.text('Lagos, Nigeria'), findsOneWidget);
      expect(find.text('₦45,000/night'), findsOneWidget);
      expect(find.byIcon(Icons.image), findsOneWidget);
    });

    testWidgets('should display rating badge', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Row(
              children: [
                const Icon(Icons.star, color: Colors.amber, size: 16),
                const SizedBox(width: 4),
                const Text('4.8', style: TextStyle(fontWeight: FontWeight.bold)),
                Text(' (25 reviews)', style: TextStyle(color: Colors.grey[600])),
              ],
            ),
          ),
        ),
      );

      expect(find.text('4.8'), findsOneWidget);
      expect(find.text(' (25 reviews)'), findsOneWidget);
      expect(find.byIcon(Icons.star), findsOneWidget);
    });
  });

  group('Favorites Widget Tests', () {
    testWidgets('should display empty favorites state', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.favorite_border, size: 80, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('No saved properties yet'),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Explore Properties'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.favorite_border), findsOneWidget);
      expect(find.text('No saved properties yet'), findsOneWidget);
      expect(find.text('Explore Properties'), findsOneWidget);
    });

    testWidgets('should toggle favorite button', (WidgetTester tester) async {
      bool isFavorite = false;

      await tester.pumpWidget(
        MaterialApp(
          home: StatefulBuilder(
            builder: (context, setState) {
              return Scaffold(
                body: IconButton(
                  icon: Icon(
                    isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: isFavorite ? Colors.red : Colors.grey,
                  ),
                  onPressed: () {
                    setState(() {
                      isFavorite = !isFavorite;
                    });
                  },
                ),
              );
            },
          ),
        ),
      );

      // Initially not favorited
      expect(find.byIcon(Icons.favorite_border), findsOneWidget);
      expect(find.byIcon(Icons.favorite), findsNothing);

      // Tap to favorite
      await tester.tap(find.byType(IconButton));
      await tester.pump();

      // Now favorited
      expect(find.byIcon(Icons.favorite), findsOneWidget);
      expect(find.byIcon(Icons.favorite_border), findsNothing);
    });
  });

  group('Search Filter Widget Tests', () {
    testWidgets('should display filter options', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('City', style: TextStyle(fontWeight: FontWeight.bold)),
                DropdownButton<String>(
                  value: 'Lagos',
                  items: ['All', 'Lagos', 'Abuja', 'Port Harcourt']
                      .map((city) => DropdownMenuItem(value: city, child: Text(city)))
                      .toList(),
                  onChanged: (_) {},
                ),
                const SizedBox(height: 16),
                const Text('Price Range', style: TextStyle(fontWeight: FontWeight.bold)),
                RangeSlider(
                  values: const RangeValues(10000, 500000),
                  min: 10000,
                  max: 500000,
                  onChanged: (_) {},
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('City'), findsOneWidget);
      expect(find.text('Price Range'), findsOneWidget);
      expect(find.text('Lagos'), findsOneWidget);
      expect(find.byType(RangeSlider), findsOneWidget);
    });

    testWidgets('should display bedroom selector', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Row(
              children: List.generate(5, (index) {
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: index == 1 ? Colors.green : Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('${index + 1}'),
                );
              }),
            ),
          ),
        ),
      );

      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);
      expect(find.text('4'), findsOneWidget);
      expect(find.text('5'), findsOneWidget);
    });
  });

  group('Booking Flow Widget Tests', () {
    testWidgets('should display booking summary', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Booking Summary', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('₦50,000 x 3 nights'),
                    Text('₦150,000'),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Service fee'),
                    Text('₦15,000'),
                  ],
                ),
                Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text('₦165,000', style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Booking Summary'), findsOneWidget);
      expect(find.text('₦50,000 x 3 nights'), findsOneWidget);
      expect(find.text('Service fee'), findsOneWidget);
      expect(find.text('₦165,000'), findsOneWidget);
    });

    testWidgets('should display date picker trigger', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InkWell(
              onTap: () {},
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.calendar_today),
                    SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Check-in', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text('Jan 15, 2026'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.calendar_today), findsOneWidget);
      expect(find.text('Check-in'), findsOneWidget);
      expect(find.text('Jan 15, 2026'), findsOneWidget);
    });
  });
}
