import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { CreditCard, Minus, Plus, ShoppingCart, Store, Trash2, UserRound } from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const initialProducts = [
  {
    id: 1,
    name: "Barra de sonido Aiwa AW-SBH21W-W",
    category: "Audio",
    price: 2099,
    image: "/products/barra-sonido-aiwa.png"
  },
  {
    id: 2,
    name: "Reloj inteligente Stratos 4",
    category: "Tecnologia",
    price: 1205,
    image: "/products/reloj-inteligente-stratos.png"
  },
  {
    id: 3,
    name: "Harman Kardon Luna 2 Bluetooth",
    category: "Audio",
    price: 2011,
    image: "/products/harman-kardon-luna.png"
  },
  {
    id: 4,
    name: "Sony Joystick DualSense PlayStation 5",
    category: "Gaming",
    price: 1299,
    image: "/products/control-dualsense.png"
  },
  {
    id: 5,
    name: "JBL Tune 770NC Black",
    category: "Audio",
    price: 1126,
    image: "/products/audifonos-jbl-tune.png"
  },
  {
    id: 6,
    name: "Frigobar Signa 48 litros",
    category: "Hogar",
    price: 3498,
    image: "/products/frigobar-signa.png"
  },
  {
    id: 7,
    name: "Haylou S40 audifonos gamer ANC",
    category: "Gaming",
    price: 677,
    image: "/products/audifonos-haylou-s40.png"
  }
];

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(value);
}

function simulatedPayment(method, total) {
  const prefix = method.toUpperCase().replace("_", "-");

  return {
    message: "Pago simulado aprobado.",
    method,
    status: "approved",
    transactionId: `${prefix}-${Date.now().toString().slice(-6)}`,
    total
  };
}

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ id: null, name: "", email: "", password: "", address: "" });
  const [authMode, setAuthMode] = useState("register");
  const [paymentMethod, setPaymentMethod] = useState("mercado_pago");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(() => setProducts(initialProducts));
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );
  const shipping = cart.length > 0 ? 99 : 0;
  const total = subtotal + shipping;

  function addToCart(product) {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  async function handleAccount(event) {
    event.preventDefault();

    if (!customer.email || !customer.password || (authMode === "register" && (!customer.name || !customer.address))) {
      setMessage("Completa los datos de la cuenta del cliente.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No se pudo procesar la cuenta.");
        return;
      }

      setCustomer({ ...data.user, password: "" });
      setMessage(data.message);
    } catch {
      const demoUser = {
        id: Date.now(),
        name: customer.name || "Cliente demo",
        email: customer.email,
        address: customer.address || "Direccion capturada en Netlify",
        password: ""
      };
      setCustomer(demoUser);
      setMessage("Cuenta lista en modo Netlify.");
    }
  }

  async function finishOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
      setMessage("Agrega al menos un producto al carrito.");
      return;
    }

    if (!customer.name || !customer.email || !customer.address) {
      setMessage("Completa tus datos para finalizar la compra.");
      return;
    }

    const order = {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address
      },
      items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      paymentMethod,
      total
    };

    try {
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        setMessage(orderData.error || "No se pudo registrar la orden.");
        return;
      }

      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: paymentMethod, total })
      });

      const data = await response.json();
      setMessage(`Pedido confirmado. Orden: ${orderData.orderId}. Folio: ${orderData.transactionId || data.transactionId}`);
      setCart([]);
    } catch {
      const data = simulatedPayment(paymentMethod, total);
      setMessage(`Pedido confirmado en modo Netlify. Folio: ${data.transactionId}`);
      setCart([]);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-ink">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-brand text-white">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Tienda Nova</h1>
              <p className="text-sm text-slate-500">Compra en linea con entrega a domicilio</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded border bg-slate-50 px-3 py-2 text-sm">
            <ShoppingCart size={18} />
            {cart.reduce((totalItems, item) => totalItems + item.quantity, 0)} productos
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_390px]">
        <div>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Catalogo</h2>
              <p className="text-slate-600">Productos disponibles para venta en linea.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <img className="h-44 w-full object-cover" src={product.image} alt={product.name} />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">{product.category}</p>
                  <h3 className="mt-1 min-h-12 text-lg font-bold">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-coral">{money(product.price)}</span>
                    <button
                      className="rounded bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                      onClick={() => addToCart(product)}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border bg-white p-5 shadow-sm">
          <section className="mb-5 border-b pb-5">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <UserRound size={22} />
              Cuenta del cliente
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded bg-slate-100 p-1 text-sm font-semibold">
              <button
                className={`rounded px-3 py-2 ${authMode === "register" ? "bg-white shadow-sm" : "text-slate-500"}`}
                onClick={() => setAuthMode("register")}
                type="button"
              >
                Registro
              </button>
              <button
                className={`rounded px-3 py-2 ${authMode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Login
              </button>
            </div>
            <form className="mt-3 space-y-3" onSubmit={handleAccount}>
              {authMode === "register" && (
                <input className="field" placeholder="Nombre completo" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
              )}
              <input className="field" placeholder="Correo electronico" type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
              <input className="field" placeholder="Contraseña" type="password" value={customer.password} onChange={(event) => setCustomer({ ...customer, password: event.target.value })} />
              {authMode === "register" && (
                <textarea className="field min-h-20" placeholder="Direccion de entrega" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />
              )}
              <button className="w-full rounded border border-brand px-4 py-2 font-bold text-brand hover:bg-teal-50" type="submit">
                {authMode === "register" ? "Crear cuenta" : "Entrar"}
              </button>
            </form>
            {customer.id && (
              <p className="mt-3 rounded bg-emerald-50 p-3 text-sm text-emerald-900">
                Cliente activo: {customer.name} ({customer.email})
              </p>
            )}
          </section>

          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CreditCard size={22} />
            Checkout
          </h2>

          <div className="mt-4 space-y-3">
            {cart.length === 0 && <p className="rounded border border-dashed p-4 text-sm text-slate-500">Tu carrito esta vacio.</p>}
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b pb-3">
                <img className="h-14 w-14 rounded object-cover" src={item.image} alt={item.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-500">{money(item.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="icon-button" onClick={() => changeQuantity(item.id, -1)} aria-label="Quitar uno">
                    <Minus size={15} />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button className="icon-button" onClick={() => changeQuantity(item.id, 1)} aria-label="Agregar uno">
                    <Plus size={15} />
                  </button>
                  <button className="icon-button text-coral" onClick={() => removeItem(item.id)} aria-label="Eliminar">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form className="mt-5 space-y-3" onSubmit={finishOrder}>
            <input className="field" placeholder="Nombre completo" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
            <input className="field" placeholder="Correo electronico" type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
            <textarea className="field min-h-20" placeholder="Direccion de entrega" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />

            <div>
              <label className="text-sm font-semibold">Metodo de pago</label>
              <select className="field mt-1" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="mercado_pago">Mercado Pago</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            <div className="space-y-2 rounded bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div className="flex justify-between"><span>Envio</span><strong>{money(shipping)}</strong></div>
              <div className="flex justify-between border-t pt-2 text-base"><span>Total</span><strong>{money(total)}</strong></div>
            </div>

            <button className="w-full rounded bg-coral px-4 py-3 font-bold text-white hover:bg-rose-700" type="submit">
              Confirmar compra
            </button>
          </form>

          {message && <p className="mt-4 rounded border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{message}</p>}
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
