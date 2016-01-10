Decouple Android with Dagger and Otto
=====================================
![Otto Dagger](https://raw.github.com/myotive/decouple-android-example/master/images/Otto_Dagger.png)

## Abstract
As Android applications increase in complexity, ensuring effective communication between components becomes more difficult. For example, when using fragments, developers increasingly find themselves in situations where they have to update one or more other fragments based on a change in state. Using traditional methods, such as interfaces or function calls, corners developers in a world of tightly coupled modules. Otto is an event bus that enables publishing and subscribing to system events. This allows for the system to be flexible and independent from other modules. Dagger is a dependency injection library for Android that goes the extra mile to enable creation of an application that is loosely coupled, extensible, and maintainable. This talk will introduce the basics of Otto and Dagger. The concepts of each will be explained and code samples that show how to solve common problems will be provided.

[Slides](https://docs.google.com/presentation/d/1Q5QvmWF2U7xh54rcTQdVx1jE_eRN-VRqZF5CWObJQ5s/edit?usp=sharing)

[Sample app](https://github.com/myotive/decouple-android-example)
