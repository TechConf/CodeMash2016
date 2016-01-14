# 6 Ways to Prevent Code Abuse

You wrote a great library for your team to use. But if there is a way to mess it up, they'll find it. How can you have confidence that they will use your code correctly?

You can't unit test their code. You can't review every line. But if they have a problem with your code, then suddenly you have a problem.

Fortunately, there is a way to prevent people from using your code wrong: mathematical proof. And the great news is that you -- and they -- have access to a theorem prover that will enforce the rules you set. It's called the compiler.

Here are 6 ways to use the compiler to prove the correctness of other people's code.

## Parameters

In Bertrand Meyer's "Object Oriented Software Construction", we learn that methods can have preconditions. That is, certain conditions must be met before we can call them. Meyer talks of throwing exceptions when assertions are violated. But what if you could use the compiler to prevent the call when the precondition is not met?

You can do that with parameters. Express the precondition as a parameter to the method. For example, suppose that the contract of the following class is that you must begin a transaction before using the service:

```C#
public class ShoppingService
{
    public void BeginTransaction()
    {
    }

	public void AddToCart(int cartId, int itemId, int quantity)
	{
	}
}
```

People who use this API could forget to call BeginTransaction first. But not if you expect the Transaction as a parameter:

```C#
public class ShoppingService
{
    public Transaction BeginTransaction()
    {
    }

	public void AddToCart(Transaction t, int cartId, int itemId, int quantity)
	{
	}
}
```

## Callbacks

In the previous example, one method had to be called before another. But what if you have something that you want to call right in the middle? For example, there's a right way to use the Cache utility class that you created for your team:

```C#
if (cache.Contains(key))
{
	value = cache.Get(key);
}
else
{
	value = LoadValue(key);
	cache.Add(key, value);
}
```

Unfortunately, they did it the wrong way.

```C#
value = cache.Get(key);
if (value == null)
{
	value = LoadValue(key);
	cache.Add(key, value);
}
```

Don't give them the chance. Take the little bit that you want them to write, and make it a callback.

```C#
var value = cache.Get(key, LoadValue);
```

## Constructors

Constructors provide a really strong assertion: something is done once and only once. Instead of throwing exceptions and writing documentation that your team won't read, put code that should only be run once into a constructor.

The MSDN documentation for the Socket class says that you should call Bind before calling Listen. And you can't bind to another port after you've started listening.

So maybe they should turn this:

```C#
public class Socket
{
    public Socket() { }

    public void Bind(EndPoint localEP) { }
    public void Listen(int backlog) { }
}
```

into this:

```C#
public class BoundSocket
{
    public BoundSocket(EndPoint localEP) { }

    public void Listen(int backlog) { }
}
```

## Immutability

One method started some work. Another continues where it left off. You initialize some things in the first method, and you want assurance that nothing has changed between that and the second.

Why not make those things immutable? For example, the MSDN documentation for the Connection class says that you can't change the connection string while the connection is open. So why not make the ConnectionString property immutable?

It's currently defined as a mutable property that throws when it's changed at the wrong time:

```C#
public class Connection
{
	private string _connectionString;
	private bool _connected = false;

	public string ConnectionString
	{
		get
		{
			return _connectionString;
		}
		set
		{
			if (_connected)
				throw new ApplicationException();

			_connectionString = value;
		}
	}
}
```

Just make that field `readonly` and the compiler won't let them change it.

```C#
public class Connection
{
	private readonly string _connectionString;
	private bool _connected = false;

    public Connection(string connectionString)
    {
        _connectionString = connectionString;
    }

	public string ConnectionString
	{
		get
		{
			return _connectionString;
		}
	}
}
```

Of course now you have to initialize it in the constructor.

__CAUTION:__ You might read advice to give your properties a private setter in order to make them immutable. _This advice is incorrect._ Private setters only prevent _outside_ code from mutating your properties. Your class could still change these properties, and the the compiler would allow it.

Don't do this expecting immutability:

```C#
public class Connection
{
    public string ConnectionString { get; private set; }
}
```

In C# 6, you can define getter-only auto-properties. These are in fact immutable.

```C#
public class Connection
{
    public string ConnectionString { get; }
}
```

Just like a `readonly` field, these can be initialized only in the constructor.

## Factories

We've talked about preconditions that require that an object be in a certain state before you call a method. This can be because you called another method first (Parameters), because you initialized it (Constructors), or because it hasn't changed since it was initialized (Immutability).

Now let's talk about preconditions on the parameters to a method. Before you can call a method, one of its parameters must be in the proper state. For example, you can only call the `CustomerRepository` with a valid `Customer`.

```C#
public class CustomerRepository
{
    public void Save(Customer customer)
    {
        if (!customer.Validate())
            throw new ArgumentException();
    }
}
```

How can you prove that the `Customer` is valid before calling the repository? Simple, make it impossible to construct an invalid `Customer`.

```C#
public static Customer Create(string name, string phoneNumber)
{
    if (ValidPhoneNumber.IsMatch(phoneNumber))
    {
        return new Customer(name, phoneNumber);
    }
    else
    {
        throw new ArgumentException();
    }
}
```

"How is this any better?" you may ask. We're still throwing an exception.

This is better because we throw the exception earlier. The phone number comes from untrusted input -- the user, the database, a service call, etc. We have to validate it at run time. By using a factory, we've pushed that validation to the edge of our system. If the factory is the only way to get a `Customer`, then we have proven that every `Customer` that appears in code is valid.

"But you said that we should avoid exceptions." I did, didn't I. Well then, we need another tool...

# Monads

A monad is an augmented value. By *augmented*, I mean that it carries extra information. This is information about the process in which that value is being used. For example, we could carry around extra information about the Customer. Let's start here:

```C#
public class CustomerErrorMonad
{
    private readonly Customer _value;
    private readonly string _error;

    public CustomerErrorMonad(Customer value, string error)
    {
        _value = value;
        _error = error;
    }
}
```

This isn't really a monad, yet. But we'll get there.

We're carrying error information about a potential customer. Notice that we've made it immutable, so we're off to a good start. Now I want to ensure that it's in one of two states: either we have an error, or we have a valid `Customer`. How can I prove that? With factories, of course!

```C#
public class CustomerErrorMonad
{
    private readonly Customer _value;
    private readonly string _error;

    private CustomerErrorMonad(Customer value, string error)
    {
        _value = value;
        _error = error;
    }

    public static CustomerErrorMonad Error(string error)
    {
        return new CustomerErrorMonad(null, error);
    }

    public static CustomerErrorMonad Valid(Customer customer)
    {
        return new CustomerErrorMonad(customer, null);
    }
}
```

We've made the constructor private so that the only way to get a `CustomerErrorMonad` is by calling one of two factory methods. Either we have no customer and an error, or we have no error and a customer. We can't have both. (We *could* have neither if you pass a `null` into one of these methods. I can't prove that you didn't ... yet).

Now my `Customer` factory can return a `CustomerErrorMonad`. It will return a `CustomerErrorMonad.Error()` if there's a problem, instead of throwing an exception.

```C#
public static Customer Create(string name, string phoneNumber)
{
    if (ValidPhoneNumber.IsMatch(phoneNumber))
    {
        return CustomerErrorMonad.Valid(new Customer(name, phoneNumber));
    }
    else
    {
        return CustomerErrorMonad.Error("Invalid phone number");
    }
}
```

Next we want to get the value out of the monad. But we don't just want to expose properties. We want to be sure that those properties are only referenced under the correct conditions. How can we prove that? Callbacks!

```C#
public CustomerErrorMonad OnError(Action<string> onError)
{
    if (_error != null)
        onError(_error);
    return this;
}

public CustomerErrorMonad OnValid(Action<Customer> onValid)
{
    if (_error == null)
        onValid(_value);
    return this;
}
```

This is a useful class as it is. But it could be generalized. There's nothing specific to `Customer`s in this code. So let's turn that into a generic parameter.

```C#
public class ErrorMonad<T>
{
    private readonly T _value;
    private readonly string _error;

    private ErrorMonad(T value, string error)
    {
        _value = value;
        _error = error;
    }

    public static ErrorMonad<T> Error(string error)
    {
        return new ErrorMonad<T>(default(T), error);
    }

    public static ErrorMonad<T> Valid(T value)
    {
        return new ErrorMonad<T>(value, null);
    }

    public ErrorMonad<T> OnError(Action<string> onError)
    {
        if (_error != null)
            onError(_error);
        return this;
    }

    public ErrorMonad<T> OnValid(Action<T> onValid)
    {
        if (_error == null)
            onValid(_value);
        return this;
    }
}
```

And finally, we'll want to perform more operations on these values. Maybe we'll save a customer to the repository and get back it's ID. If there was an error creating the `Customer`, then we should propogate that error. But there could also be an error saving the `Customer`. So let's rewrite the repository method like this:

```C#
public class CustomerRepository
{
    public ErrorMonad<int> Save(Customer customer)
    {
        if (Successful)
            return ErrorMonad<int>.Valid(customerId);
        else
            return ErrorMonad<int>.Error("Failed to save customer.");
    }
}
```

As the signature says, we have to have a valid `Customer` in order to call `Save`. So there is no need to guard the parameter. But the method could fail, so it produces either a customer ID or an error.

Now to chain these together. I should be able to create a `Customer` from name and phone number, and then save it to the `CustomerRepository`.

```C#
Customer.Create(name, phoneNumber)
    .AndThen(customer => repository.Save(customer))
    .OnError(ShowError)
    .OnValid(ReturnCustomerId);
```

The `AndThen` method converts an `ErrorMonad` of one type to an `ErrorMonad` of another. It looks like this:

```C#
public ErrorMonad<U> AndThen<U>(Func<T, ErrorMonad<U>> step)
{
    if (_error != null)
        return ErrorMonad<U>.Error(_error);
    else
        return step(_value);
}
```

And now this is a proper monad. Monads are always generic. They always have a method with the signature of `AndThen` (which is formally called the *bind* method). And they have factory methods for the various potential configurations (the one that takes the generic value is formally called -- confusingly --- *return*).

If you construct your APIs using these 6 techniques, then you are telling the rest of your team -- and the compiler -- how the API is supposed to be used. The compiler will do the hard work of mathematically proving that their code is correct. And you can sleep well knowing that you've done your part to prevent code abuse.