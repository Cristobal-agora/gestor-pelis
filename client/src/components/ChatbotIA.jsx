import React, { useState, useRef, useEffect } from "react";
import "./ChatbotIA.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaCommentDots } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";

const ChatbotIA = () => {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [cargando, setCargando] = useState(false);
  const mensajesRef = useRef(null);

  const toggleChat = () => setAbierto(!abierto);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  useEffect(() => {
    const textarea = document.querySelector(".chatbot-entrada textarea");
    if (!textarea) return;

    const handleFocus = () => {
      setTimeout(() => {
        mensajesRef.current?.scrollTo({
          top: mensajesRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 300); // da tiempo a que aparezca el teclado
    };

    textarea.addEventListener("focus", handleFocus);
    return () => textarea.removeEventListener("focus", handleFocus);
  }, []);

  const enviarPregunta = async () => {
    if (!entrada.trim()) return;
    const nuevaEntrada = { rol: "user", texto: entrada };
    setMensajes((prev) => [...prev, nuevaEntrada]);
    setEntrada("");
    setCargando(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pregunta: entrada }),
      });
      const data = await res.json();
      const respuestaIA = { rol: "ia", texto: data.respuesta };
      setMensajes((prev) => [...prev, respuestaIA]);
    } catch (err) {
      console.error("Error al contactar con la IA:", err); // 👈 Añade esta línea
      setMensajes((prev) => [
        ...prev,
        { rol: "ia", texto: "Error al contactar con la IA." },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarPregunta();
    }
  };

  return (
    <>
      <div className="chatbot-boton" onClick={toggleChat}>
        <FaCommentDots size={28} color="#fff" />
      </div>

      <AnimatePresence>
        {abierto && (
          <motion.div
            className="chatbot-ventana"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="chatbot-cabecera">
              <strong>IA CineStash</strong>
              <button
                className="chatbot-cerrar"
                onClick={toggleChat}
                aria-label="Cerrar chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.146 2.146a.5.5 0 0 1 .708 0L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>

            <div className="chatbot-mensajes" ref={mensajesRef}>
              <AnimatePresence initial={false}>
                {mensajes.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className={`chatbot-mensaje ${
                      msg.rol === "user" ? "usuario" : "ia"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => {
                          const esInterno =
                            href?.startsWith("/") && !href?.startsWith("//");
                          return esInterno ? (
                            <Link to={href} onClick={() => setAbierto(false)}>
                              {children}
                            </Link>
                          ) : (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          );
                        },
                      }}
                    >
                      {msg.texto}
                    </ReactMarkdown>
                  </motion.div>
                ))}
                {cargando && (
                  <motion.div
                    className="chatbot-mensaje ia"
                    key="cargando"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    Escribiendo...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="chatbot-entrada">
              <textarea
                rows="2"
                placeholder="Pregúntame sobre películas, actores, etc..."
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button onClick={enviarPregunta}>Enviar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotIA;
