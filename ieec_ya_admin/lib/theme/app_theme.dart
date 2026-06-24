import 'package:flutter/material.dart';

class IeecPalette {
  static const deepPurpleAccent = Color(0xFF651FFF);
  static const slateGrey = Color(0xFF1E1E24);
  static const crispWhite = Color(0xFFFFFFFF);
  static const charcoalBlack = Color(0xFF121212);
  static const softGrey = Color(0xFFF4F4F7);
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
}

class IeecTheme {
  static ThemeData light() => ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: IeecPalette.deepPurpleAccent,
          brightness: Brightness.light,
          primary: IeecPalette.deepPurpleAccent,
          surface: IeecPalette.crispWhite,
        ),
        scaffoldBackgroundColor: IeecPalette.softGrey,
        useMaterial3: true,
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          color: IeecPalette.crispWhite,
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(18)),
          filled: true,
          fillColor: IeecPalette.crispWhite,
        ),
      );

  static ThemeData dark() => ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: IeecPalette.deepPurpleAccent,
          brightness: Brightness.dark,
          primary: IeecPalette.deepPurpleAccent,
          surface: IeecPalette.slateGrey,
        ),
        scaffoldBackgroundColor: IeecPalette.charcoalBlack,
        useMaterial3: true,
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          color: IeecPalette.slateGrey,
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(18)),
          filled: true,
        ),
      );
}
