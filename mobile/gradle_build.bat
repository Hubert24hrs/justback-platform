@echo off
set "ANDROID_HOME=C:\Users\HP\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\HP\AppData\Local\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

cd android
echo Running Gradle assembleDebug...
.\gradlew assembleDebug --stacktrace
