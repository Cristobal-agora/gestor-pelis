import React, { useRef, useState, useEffect } from "react";

const TextoColapsado = ({ texto, lineas = 3 }) => {
  const [expandido, setExpandido] = useState(false);
  const [hayOverflow, setHayOverflow] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      setHayOverflow(ref.current.scrollHeight > ref.current.clientHeight);
    }
  }, [texto]);

  return (
    <div>
      <div
        ref={ref}
        style={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: expandido ? "unset" : lineas,
          WebkitBoxOrient: "vertical",
        }}
      >
        {texto}
      </div>
      {hayOverflow && (
        <button
          className="btn btn-link btn-sm text-info p-0 mt-1"
          onClick={() => setExpandido(!expandido)}
        >
          {expandido ? "Mostrar menos" : "Mostrar más"}
        </button>
      )}
    </div>
  );
};

export default TextoColapsado;
