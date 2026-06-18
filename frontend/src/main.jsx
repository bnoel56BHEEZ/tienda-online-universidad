import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bell, CreditCard, LogOut, Minus, Plus, ShieldCheck, ShoppingCart, Store, Trash2, UserRound } from "lucide-react";
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
  const [customer, setCustomer] = useState({ id: null, name: "", email: "", password: "", address: "", role: "user" });
  const [authMode, setAuthMode] = useState("register");
  const [adminSummary, setAdminSummary] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mercado_pago");
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState("");

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

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = window.setTimeout(() => setNotification(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notification]);

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

  function signOut() {
    setCustomer({ id: null, name: "", email: "", password: "", address: "", role: "user" });
    setAdminSummary(null);
    setMessage("Sesion cerrada.");
    setNotification("Sesion cerrada correctamente.");
  }

  async function loadAdminSummary() {
    try {
      const response = await fetch(`${API_URL}/admin/summary`);
      const data = await response.json();

      if (response.ok) {
        setAdminSummary(data);
      }
    } catch {
      setAdminSummary({
        totalUsers: 1,
        totalOrders: 0,
        totalSales: 0,
        recentOrders: []
      });
    }
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

      const loggedUser = { ...data.user, password: "" };
      setCustomer(loggedUser);
      setMessage(data.message);
      setNotification(data.message);

      if (loggedUser.role === "admin") {
        loadAdminSummary();
      } else {
        setAdminSummary(null);
      }
    } catch {
      const isDemoAdmin = customer.email.toLowerCase().trim() === "admin@tiendanova.com" && customer.password === "admin123";
      const demoUser = {
        id: Date.now(),
        name: isDemoAdmin ? "Administrador" : customer.name || "Cliente demo",
        email: customer.email,
        address: isDemoAdmin ? "Panel administrativo" : customer.address || "Direccion capturada en Netlify",
        password: "",
        role: isDemoAdmin ? "admin" : "user"
      };
      setCustomer(demoUser);
      setMessage(isDemoAdmin ? "Inicio de sesion como administrador." : "Cuenta lista en modo Netlify.");
      setNotification(isDemoAdmin ? "Inicio de sesion como administrador." : "Inicio de sesion como usuario.");

      if (isDemoAdmin) {
        setAdminSummary({
          totalUsers: 4,
          totalOrders: 3,
          totalSales: 6893,
          recentOrders: [
            {
              id: 3,
              customer_name: "Cliente demo",
              payment_method: "mercado_pago",
              payment_status: "approved",
              total: 2198
            },
            {
              id: 2,
              customer_name: "Usuario prueba",
              payment_method: "paypal",
              payment_status: "approved",
              total: 1299
            },
            {
              id: 1,
              customer_name: "Compra inicial",
              payment_method: "stripe",
              payment_status: "approved",
              total: 3396
            }
          ]
        });
      }
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
      setNotification("Pedido confirmado correctamente.");
      setCart([]);
      if (customer.role === "admin") {
        loadAdminSummary();
      }
    } catch {
      const data = simulatedPayment(paymentMethod, total);
      setMessage(`Pedido confirmado en modo Netlify. Folio: ${data.transactionId}`);
      setNotification("Pedido confirmado en modo Netlify.");
      setCart([]);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-ink">
      {notification && (
        <div className="fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-900 shadow-lg">
          <Bell size={18} />
          {notification}
        </div>
      )}

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
        {customer.id && (
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              {customer.role === "admin" ? <ShieldCheck size={18} className="text-brand" /> : <UserRound size={18} className="text-brand" />}
              <span>
                Sesion iniciada como <strong>{customer.role === "admin" ? "administrador" : "usuario"}</strong>: {customer.name}
              </span>
            </div>
            <button className="flex items-center gap-2 rounded border px-3 py-2 font-semibold hover:bg-slate-50" onClick={signOut} type="button">
              <LogOut size={16} />
              Cerrar sesion
            </button>
          </div>
        )}
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_390px]">
        <div>
          {customer.role === "admin" && (
            <section className="mb-6 rounded-lg border bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <ShieldCheck size={22} />
                    Panel de administrador
                  </h2>
                  <p className="text-sm text-slate-600">Resumen general de la tienda.</p>
                </div>
                <button className="rounded border border-brand px-3 py-2 text-sm font-bold text-brand hover:bg-teal-50" onClick={loadAdminSummary} type="button">
                  Actualizar
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded border bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Usuarios</p>
                  <strong className="text-2xl">{adminSummary?.totalUsers ?? 0}</strong>
                </div>
                <div className="rounded border bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Pedidos</p>
                  <strong className="text-2xl">{adminSummary?.totalOrders ?? 0}</strong>
                </div>
                <div className="rounded border bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Ventas</p>
                  <strong className="text-2xl">{money(adminSummary?.totalSales ?? 0)}</strong>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b text-slate-500">
                    <tr>
                      <th className="py-2">Orden</th>
                      <th>Cliente</th>
                      <th>Pago</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(adminSummary?.recentOrders ?? []).map((order) => (
                      <tr className="border-b" key={order.id}>
                        <td className="py-2">ORD-{order.id}</td>
                        <td>{order.customer_name}</td>
                        <td>{order.payment_method}</td>
                        <td>{money(Number(order.total))}</td>
                        <td>{order.payment_status}</td>
                      </tr>
                    ))}
                    {(adminSummary?.recentOrders ?? []).length === 0 && (
                      <tr>
                        <td className="py-3 text-slate-500" colSpan="5">Todavia no hay pedidos registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

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
              <input className="field" placeholder="Contrasena" type="password" value={customer.password} onChange={(event) => setCustomer({ ...customer, password: event.target.value })} />
              {authMode === "register" && (
                <textarea className="field min-h-20" placeholder="Direccion de entrega" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />
              )}
              <button className="w-full rounded border border-brand px-4 py-2 font-bold text-brand hover:bg-teal-50" type="submit">
                {authMode === "register" ? "Crear cuenta" : "Entrar"}
              </button>
            </form>
            {customer.id && (
              <p className="mt-3 rounded bg-emerald-50 p-3 text-sm text-emerald-900">
                Cuenta activa: {customer.name} ({customer.email}) - {customer.role === "admin" ? "Administrador" : "Usuario"}
              </p>
            )}
            <p className="mt-3 rounded border border-dashed p-3 text-xs text-slate-500">
              Admin demo: admin@tiendanova.com / admin123
            </p>
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
