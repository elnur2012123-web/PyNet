import type { Module } from "../types";
import { out, py } from "../helpers";

export const m13: Module = {
  id: "m13",
  number: 13,
  title: "Object-Oriented Programming",
  description: "Model the real world with classes, objects, methods and inheritance.",
  icon: "shapes",
  lessons: [
    {
      id: "m13-classes-objects",
      title: "What is OOP? Classes and objects",
      minutes: 9,
      intro: `**Object-Oriented Programming (OOP)** is a way of organising code around **objects** — things that have **data** and **behaviour**.

- A **class** is a **blueprint**. Think of the plan for a house.
- An **object** (or **instance**) is a real thing built from that blueprint. One plan → many houses.

\`class Dog:\` defines the blueprint. \`rex = Dog()\` builds an object.

You have used objects all along: every string is an object of the \`str\` class, which is why it has methods like \`.upper()\`.

Class names use **CapitalizedWords** (\`BankAccount\`), unlike variables.`,
      syntax: py`
class Dog:
    pass

rex = Dog()
print(type(rex))`,
      examples: [
        { title: "A blueprint and two objects", code: py`
class Cat:
    sound = "meow"

tom = Cat()
kitty = Cat()
print(tom.sound, kitty.sound)
print(tom is kitty)` },
        { title: "Everything is an object", code: py`
print(type("hi"))
print(type(5))
print(type([1, 2]))` },
      ],
      realWorld: `In a school app, Student, Teacher and Course would each be classes; every real student is an object with their own name and grades.`,
      mistakes: [
        { wrong: py`
class Dog:
    pass
d = Dog`, right: py`
class Dog:
    pass
d = Dog()`, why: "Without brackets you store the class itself, not a new object." },
      ],
      tryIt: py`
class Robot:
    model = "PY-1"

r1 = Robot()
r2 = Robot()
print(r1.model, r2.model)`,
      practice: [
        { prompt: "Create an empty class `Car` (use `pass`), make an object `my_car`, and print `type(my_car).__name__`.", tests: [{ expected: "Car" }], hint: "class Car: pass", solution: py`
class Car:
    pass

my_car = Car()
print(type(my_car).__name__)` },
        { prompt: 'Create a class `Planet` with a class attribute `kind = "planet"`. Make an object and print its kind.', tests: [{ expected: "planet" }], hint: "Access with obj.kind", solution: py`
class Planet:
    kind = "planet"

earth = Planet()
print(earth.kind)` },
        { prompt: "Create a class `Box`, make two objects `a` and `b`, and print whether they are the same object (`a is b`).", tests: [{ expected: "False" }], hint: "Each call to Box() creates a new object.", solution: py`
class Box:
    pass

a = Box()
b = Box()
print(a is b)` },
      ],
      quiz: [
        { q: "A class is like…", options: ["A finished house", "A blueprint", "A variable", "A loop"], answer: 1, explain: "Classes describe how to build objects." },
        { q: "How do you create an object from class `Book`?", options: ["Book", "new Book", "Book()", "create Book"], answer: 2, explain: "Call the class with brackets." },
      ],
    },
    {
      id: "m13-init-self",
      title: "Attributes, __init__() and self",
      minutes: 10,
      intro: `Objects usually need their **own data**: each dog has its own name. This data is stored in **attributes**.

**\`__init__\`** (with two underscores on each side) is a special method that runs **automatically** when a new object is created. It sets up the starting attributes.

**\`self\`** means "this particular object". Inside the class, \`self.name = name\` stores the name **on this object**.

\`class Dog:\`
\`    def __init__(self, name, age):\`
\`        self.name = name\`
\`        self.age = age\`

\`rex = Dog("Rex", 3)\` → Python calls \`__init__\` with \`self\` = the new object. You never pass \`self\` yourself.`,
      syntax: py`
class Dog:
    def __init__(self, name):
        self.name = name

d = Dog("Rex")
print(d.name)`,
      examples: [
        { title: "Two objects, different data", code: py`
class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade

a = Student("Ana", 9)
b = Student("Ben", 11)
print(a.name, a.grade)
print(b.name, b.grade)` },
        { title: "Changing an attribute", code: py`
class Light:
    def __init__(self):
        self.on = False

lamp = Light()
lamp.on = True
print(lamp.on)` },
      ],
      realWorld: `A User object in an app stores username, email and join date as attributes — every user has their own values.`,
      mistakes: [
        { wrong: py`
class Dog:
    def __init__(self, name):
        name = name`, right: py`
class Dog:
    def __init__(self, name):
        self.name = name`, why: "Without self., the name is a local variable that disappears; the object never stores it." },
      ],
      tryIt: py`
class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages

b = Book("Python 101", 250)
print(f"{b.title} has {b.pages} pages")`,
      practice: [
        { prompt: "Create class `Pet` with `__init__(self, name, species)` storing both. Create `Pet(\"Luna\", \"cat\")` and print `Luna is a cat`.", tests: [{ expected: "Luna is a cat" }], hint: "self.name = name; self.species = species", solution: py`
class Pet:
    def __init__(self, name, species):
        self.name = name
        self.species = species

p = Pet("Luna", "cat")
print(f"{p.name} is a {p.species}")` },
        { prompt: "Create class `Counter` whose `__init__` sets `self.value = 0`. Make one, set value to 5, print it.", tests: [{ expected: "5" }], hint: "c.value = 5", solution: py`
class Counter:
    def __init__(self):
        self.value = 0

c = Counter()
c.value = 5
print(c.value)` },
        { prompt: "Create class `Point` with x and y. The tests create `Point(3, 4)` and print `p.x + p.y`.", tests: [{ append: "p = Point(3, 4)\nprint(p.x + p.y)", expected: "7" }], hint: "Store both in __init__.", solution: py`
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y` },
      ],
      quiz: [
        { q: "When does `__init__` run?", options: ["When the class is defined", "When a new object is created", "When the program ends", "Only when called manually"], answer: 1, explain: "It initialises each new object." },
        { q: "What does `self` refer to?", options: ["The class", "The current object", "The parent class", "The module"], answer: 1, explain: "self is the specific instance." },
      ],
    },
    {
      id: "m13-methods",
      title: "Methods",
      minutes: 9,
      intro: `A **method** is a function defined **inside a class**. It describes what objects can **do**.

Methods always take \`self\` as their first parameter, so they can read and change the object's attributes.

\`def bark(self):\`
\`    print(self.name, "says woof")\`

Call it with a dot: \`rex.bark()\`.

Methods can take extra parameters and return values, like any function.

**\`__str__\`** is a special method that controls what \`print(obj)\` shows.`,
      syntax: py`
class Dog:
    def __init__(self, name):
        self.name = name
    def bark(self):
        return f"{self.name} says woof"`,
      examples: [
        { title: "A bank account", code: py`
class Account:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            print("Not enough money")
        else:
            self.balance -= amount

acc = Account("Ana")
acc.deposit(100)
acc.withdraw(30)
acc.withdraw(500)
print(acc.balance)` },
        { title: "__str__ for nice printing", code: py`
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __str__(self):
        return f"({self.x}, {self.y})"

print(Point(2, 5))` },
      ],
      realWorld: `\`cart.add_item()\`, \`player.jump()\`, \`email.send()\` — methods are the actions of objects in every real application.`,
      mistakes: [
        { wrong: py`
class A:
    def hello():
        print("hi")
A().hello()`, right: py`
class A:
    def hello(self):
        print("hi")
A().hello()`, why: "Methods need self as the first parameter, otherwise TypeError: takes 0 positional arguments but 1 was given." },
      ],
      tryIt: py`
class Timer:
    def __init__(self):
        self.seconds = 0
    def tick(self, n=1):
        self.seconds += n
    def __str__(self):
        return f"{self.seconds}s"

t = Timer()
t.tick()
t.tick(5)
print(t)`,
      practice: [
        { prompt: "Create class `Rectangle(width, height)` with a method `area()` that returns width × height.", tests: [{ append: "print(Rectangle(3, 4).area())\nprint(Rectangle(10, 2).area())", expected: out(12, 20) }], hint: "return self.width * self.height", solution: py`
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height` },
        { prompt: "Create class `Counter` with `value` starting at 0, a method `increment()` adding 1, and `reset()` setting it to 0.", tests: [{ append: "c = Counter()\nc.increment()\nc.increment()\nprint(c.value)\nc.reset()\nprint(c.value)", expected: out(2, 0) }], hint: "self.value += 1", solution: py`
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

    def reset(self):
        self.value = 0` },
        { prompt: 'Create class `Person(name)` with `__str__` returning `"Person: <name>"`.', tests: [{ append: 'print(Person("Zara"))', expected: "Person: Zara" }], hint: "def __str__(self): return ...", solution: py`
class Person:
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"Person: {self.name}"` },
      ],
      quiz: [
        { q: "What is a method?", options: ["A variable in a class", "A function inside a class", "A type of loop", "A module"], answer: 1, explain: "Methods are functions that belong to a class." },
        { q: "What does `__str__` control?", options: ["How the object is created", "What print(obj) shows", "How objects are compared"], answer: 1, explain: "It returns the string representation." },
      ],
    },
    {
      id: "m13-inheritance",
      title: "Inheritance",
      minutes: 9,
      intro: `**Inheritance** lets a new class **reuse** another class. The new class (the **child** or **subclass**) gets all attributes and methods of the **parent** (or **base**) class, and can add or change things.

\`class Animal:\` — the parent
\`class Dog(Animal):\` — Dog inherits from Animal

- The child can add **new methods**.
- The child can **override** a parent method by defining one with the same name.
- \`super().__init__(...)\` calls the parent's \`__init__\`, so you do not repeat its setup code.

Use inheritance for "**is a**" relationships: a Dog **is an** Animal.`,
      syntax: py`
class Parent:
    ...

class Child(Parent):
    ...`,
      examples: [
        { title: "Reusing and overriding", code: py`
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."
    def intro(self):
        return f"I am {self.name} and I say {self.speak()}"

class Dog(Animal):
    def speak(self):
        return "Woof"

class Cow(Animal):
    def speak(self):
        return "Moo"

print(Dog("Rex").intro())
print(Cow("Bella").intro())` },
        { title: "super()", code: py`
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

class Manager(Employee):
    def __init__(self, name, salary, team):
        super().__init__(name, salary)
        self.team = team

m = Manager("Ana", 5000, ["Ben", "Cy"])
print(m.name, m.salary, len(m.team))` },
      ],
      realWorld: `Game engines have a base \`Enemy\` class; \`Zombie\` and \`Dragon\` inherit movement and health, but each overrides how it attacks.`,
      mistakes: [
        { wrong: py`
class Child(Parent):
    def __init__(self, name, age):
        self.age = age`, right: py`
class Child(Parent):
    def __init__(self, name, age):
        super().__init__(name)
        self.age = age`, why: "If you override __init__ and forget super().__init__, the parent's attributes (like name) are never set." },
      ],
      tryIt: py`
class Vehicle:
    def __init__(self, wheels):
        self.wheels = wheels
    def describe(self):
        return f"I have {self.wheels} wheels"

class Bike(Vehicle):
    def __init__(self):
        super().__init__(2)

print(Bike().describe())
print(isinstance(Bike(), Vehicle))`,
      practice: [
        { prompt: 'Create `Shape` with method `name()` returning `"shape"`, and `Circle(Shape)` overriding it to return `"circle"`.', tests: [{ append: "print(Shape().name())\nprint(Circle().name())", expected: out("shape", "circle") }], hint: "Define name() in both classes.", solution: py`
class Shape:
    def name(self):
        return "shape"

class Circle(Shape):
    def name(self):
        return "circle"` },
        { prompt: "Create `Animal(name)` with method `hello()` returning `\"Hi, I am <name>\"`. Create `Bird(Animal)` with an extra method `fly()` returning `\"Flap!\"`.", tests: [{ append: 'b = Bird("Kiwi")\nprint(b.hello())\nprint(b.fly())', expected: out("Hi, I am Kiwi", "Flap!") }], hint: "Bird does not need its own __init__.", solution: py`
class Animal:
    def __init__(self, name):
        self.name = name

    def hello(self):
        return f"Hi, I am {self.name}"

class Bird(Animal):
    def fly(self):
        return "Flap!"` },
        { prompt: "Create `Person(name)` and `Student(Person)` whose `__init__(self, name, school)` uses `super()` and also stores school.", tests: [{ append: 's = Student("Ana", "PyNest High")\nprint(s.name, "-", s.school)', expected: "Ana - PyNest High" }], hint: "super().__init__(name)", solution: py`
class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, school):
        super().__init__(name)
        self.school = school` },
      ],
      quiz: [
        { q: "In `class Dog(Animal):`, which is the parent?", options: ["Dog", "Animal"], answer: 1, explain: "The class in brackets is the parent." },
        { q: "What does overriding mean?", options: ["Deleting a method", "Redefining a parent method in the child", "Calling a method twice"], answer: 1, explain: "The child's version replaces the parent's." },
      ],
    },
    {
      id: "m13-encapsulation",
      title: "Encapsulation",
      minutes: 8,
      intro: `**Encapsulation** means keeping an object's internal data **protected** and only changing it through **methods** that check the rules.

Python uses **naming conventions** rather than strict locks:

- \`_balance\` (one underscore) — "internal, please don't touch from outside".
- \`__pin\` (two underscores) — Python renames it to make accidental access harder.

**Properties** (\`@property\`) let you read a value like an attribute while running code behind the scenes, and a **setter** can validate new values.

Why bother? Imagine anyone could set \`account.balance = -1000000\`. Methods like \`deposit()\` can refuse invalid values.`,
      syntax: py`
class Account:
    def __init__(self):
        self._balance = 0

    @property
    def balance(self):
        return self._balance`,
      examples: [
        { title: "Protecting data with methods", code: py`
class Account:
    def __init__(self):
        self._balance = 0

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self._balance += amount

    @property
    def balance(self):
        return self._balance

acc = Account()
acc.deposit(50)
print(acc.balance)` },
        { title: "A validating setter", code: py`
class Thermostat:
    def __init__(self):
        self._temp = 20

    @property
    def temp(self):
        return self._temp

    @temp.setter
    def temp(self, value):
        self._temp = max(10, min(30, value))

t = Thermostat()
t.temp = 50
print(t.temp)` },
      ],
      realWorld: `A banking system never lets code set a balance directly; every change goes through deposit/withdraw methods that log and validate it.`,
      mistakes: [
        { wrong: py`account._balance = 999999  # from outside the class`, right: py`account.deposit(100)`, why: "Underscore attributes are internal. Use the public methods so the rules are enforced." },
      ],
      tryIt: py`
class Player:
    def __init__(self, name):
        self.name = name
        self._health = 100

    def take_damage(self, amount):
        self._health = max(0, self._health - amount)

    @property
    def health(self):
        return self._health

p = Player("Nova")
p.take_damage(30)
p.take_damage(200)
print(p.health)`,
      practice: [
        { prompt: "Create class `Wallet` with `_money = 0`, a method `add(amount)` that ignores amounts <= 0, and a `money` property.", tests: [{ append: "w = Wallet()\nw.add(10)\nw.add(-5)\nw.add(0)\nprint(w.money)", expected: "10" }], hint: "if amount > 0: self._money += amount", solution: py`
class Wallet:
    def __init__(self):
        self._money = 0

    def add(self, amount):
        if amount > 0:
            self._money += amount

    @property
    def money(self):
        return self._money` },
        { prompt: "Create class `Volume` with a `level` property and a setter that keeps the value between 0 and 10.", tests: [{ append: "v = Volume()\nv.level = 15\nprint(v.level)\nv.level = -3\nprint(v.level)\nv.level = 7\nprint(v.level)", expected: out(10, 0, 7) }], hint: "self._level = max(0, min(10, value)); start at 5 in __init__.", solution: py`
class Volume:
    def __init__(self):
        self._level = 5

    @property
    def level(self):
        return self._level

    @level.setter
    def level(self, value):
        self._level = max(0, min(10, value))` },
        { prompt: 'Create class `User(name, password)` storing the password in `_password`, with a method `check(pw)` returning True when it matches.', tests: [{ append: 'u = User("ana", "s3cret")\nprint(u.check("s3cret"))\nprint(u.check("guess"))', expected: out("True", "False") }], hint: "return pw == self._password", solution: py`
class User:
    def __init__(self, name, password):
        self.name = name
        self._password = password

    def check(self, pw):
        return pw == self._password` },
      ],
      quiz: [
        { q: "What does a leading underscore (`_x`) mean?", options: ["The attribute is deleted", "It is meant to be internal", "It is a constant", "It is a syntax error"], answer: 1, explain: "It is a convention for internal use." },
        { q: "What does `@property` allow?", options: ["Calling a method without brackets like an attribute", "Creating a class", "Importing modules"], answer: 0, explain: "Properties look like attributes but run code." },
      ],
    },
    {
      id: "m13-polymorphism",
      title: "Polymorphism and practical OOP",
      minutes: 10,
      intro: `**Polymorphism** ("many shapes") means different classes can be used **the same way** because they share method names.

If \`Circle\`, \`Square\` and \`Triangle\` all have an \`area()\` method, you can loop over a mixed list and call \`shape.area()\` on each — each class does its own calculation.

This makes code flexible: add a new shape class later, and the loop still works without changes.

**Putting OOP together:** good class design means each class has one clear responsibility, attributes for its data, methods for its actions, inheritance only where "is a" makes sense, and encapsulation to protect its rules.`,
      syntax: py`
for shape in shapes:
    print(shape.area())   # each class answers differently`,
      examples: [
        { title: "Same method, different classes", code: py`
import math

class Circle:
    def __init__(self, r):
        self.r = r
    def area(self):
        return math.pi * self.r ** 2

class Square:
    def __init__(self, side):
        self.side = side
    def area(self):
        return self.side ** 2

for s in [Circle(1), Square(3)]:
    print(type(s).__name__, round(s.area(), 2))` },
        { title: "A small library system", code: py`
class Book:
    def __init__(self, title):
        self.title = title
        self.borrowed = False

class Library:
    def __init__(self):
        self.books = []
    def add(self, book):
        self.books.append(book)
    def available(self):
        return [b.title for b in self.books if not b.borrowed]

lib = Library()
lib.add(Book("Dune"))
lib.add(Book("Emma"))
lib.books[0].borrowed = True
print(lib.available())` },
      ],
      realWorld: `A payment system can treat CardPayment, PayPalPayment and CashPayment the same way — each has a \`pay(amount)\` method.`,
      mistakes: [
        { wrong: py`
for s in shapes:
    if type(s) == Circle:
        print(3.14 * s.r ** 2)
    elif type(s) == Square:
        print(s.side ** 2)`, right: py`
for s in shapes:
    print(s.area())`, why: "Long type checks defeat the purpose. Let each class implement the shared method." },
      ],
      tryIt: py`
class Duck:
    def speak(self):
        return "Quack"

class Robot:
    def speak(self):
        return "Beep"

for thing in [Duck(), Robot()]:
    print(thing.speak())`,
      practice: [
        { prompt: 'Create classes `Dog` and `Cat`, each with `speak()` returning `"Woof"` / `"Meow"`. The tests loop over both.', tests: [{ append: "for a in [Dog(), Cat()]:\n    print(a.speak())", expected: out("Woof", "Meow") }], hint: "Two small classes with the same method name.", solution: py`
class Dog:
    def speak(self):
        return "Woof"

class Cat:
    def speak(self):
        return "Meow"` },
        { prompt: "Create `Square(side)` and `Rect(w, h)`, both with `area()`. Then define `total_area(shapes)` that returns the sum of all areas.", tests: [{ append: "print(total_area([Square(2), Rect(3, 4)]))", expected: "16" }], hint: "return sum(s.area() for s in shapes)", solution: py`
class Square:
    def __init__(self, side):
        self.side = side
    def area(self):
        return self.side ** 2

class Rect:
    def __init__(self, w, h):
        self.w = w
        self.h = h
    def area(self):
        return self.w * self.h

def total_area(shapes):
    return sum(s.area() for s in shapes)` },
        { prompt: 'Create `TodoList` with `add(task)`, `done(task)` (removes it if present), and `count()` returning the number of tasks.', tests: [{ append: 't = TodoList()\nt.add("a")\nt.add("b")\nt.done("a")\nt.done("zzz")\nprint(t.count())', expected: "1" }], hint: "Store tasks in a list inside __init__.", solution: py`
class TodoList:
    def __init__(self):
        self.tasks = []

    def add(self, task):
        self.tasks.append(task)

    def done(self, task):
        if task in self.tasks:
            self.tasks.remove(task)

    def count(self):
        return len(self.tasks)` },
      ],
      quiz: [
        { q: "Polymorphism lets you…", options: ["Use different classes through the same method names", "Create classes faster", "Avoid writing methods"], answer: 0, explain: "Same interface, different behaviour." },
        { q: "What is printed?", code: py`
class A:
    def f(self): return "A"
class B(A):
    def f(self): return "B"
print([x.f() for x in [A(), B()]])`, options: ["['A', 'A']", "['A', 'B']", "['B', 'B']"], answer: 1, explain: "Each object uses its own class's f." },
      ],
    },
  ],
};
