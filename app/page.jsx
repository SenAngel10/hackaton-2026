"use client";
import FeedbackItem from "@/components/FeedbackItem";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  //estados de mensajes
  const [messages, setMessages] = useState([]);
  const [textUsuario, setTextUsuario] = useState("");
  const [contador, setContador] = useState(0); //limitamos request por usuario
  const limite = 20;

  //controlador del scroll
  const panelRef = useRef(null);

  async function enviarPost(textU) {
    if (contador < limite) {
      setContador((c) => c + 1); //a la hora de la prueba xd
      //el estardar es pasar un objeto de role y content al modelo
      let msgUser = { role: "user", content: `${textU}` };
      const url = "http://localhost:3000/api/chat";
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: `${textU}` }),
        });

        if (!resp.ok) {
          throw new Error(`Response Status: ${resp.status}`);
        }
        const result = await resp.json();
        let msgAssistant = {
          role: "assistant",
          reply: result.reply,
          feedback: result.feedback,
        }; //feedbak: [tipo: capitalization, original: brayan]
        setMessages([...messages, msgUser, msgAssistant]);
        console.log(result);
      } catch (error) {
        console.error(error.message);
      }
    } else {
      alert("llegaste al limite");
    }
  }

  //actualizar hasta el ultimo chat
  useEffect(() => {
    const containerPanel = panelRef.current;
    if (containerPanel) {
      containerPanel.scrollTop = containerPanel.scrollHeight;
    }
    console.log(messages);
  }, [messages]);

  return (
    <div className="grid grid-cols-1 gap-5 bg-blue-100 text-principal h-screen justify-center ml-auto mr-auto p-3 w-full mx-auto lg:max-w-[1028px] md:min-w-[400px] md:min-h-[400px]">
      {/* Panel de msg*/}
      <section
        ref={panelRef}
        className="flex flex-col content-start w-full gap-4 overflow-auto h-160 text-[20px] scroll-smooth scrollbar-hide float-root border-white border-2"
      >
        {messages.map((x, index) => {
          if (x.role === "user") {
            return (
              <div
                className="self-end bg-blue-600 text-white rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl p-2 m-4 max-w-[50%]  inline-block"
                key={index}
              >
                {x.content}
              </div>
            );
          } else {
            return (
              <div
                className="self-start bg-bubujas-ia text-principal rounded-br-2xl rounded-tl-2xl rounded-tr-2xl p-2 m-4 max-w-[70%]  inline-block"
                key={index}
              >
                <p className="w-full">{x.reply}</p>
                {x.feedback.map((value, index) => {
                  return <FeedbackItem value={value} key={index} i={index} />;
                })}
              </div>
            );
          }
        })}
      </section>

      {/* usuario */}
      <section className="flex justify-around w-full h-full items-center ">
        <input
          className="w-3/4 rounded-full border-white border-2 focus:border-bubujas-ia focus:outline outline-none p-1 h-10"
          type="text"
          value={textUsuario}
          onChange={(e) => setTextUsuario(e.target.value)}
          placeholder="Escribe tu mensaje"
        />

        <button
          className="rounded-full border-white border-2 hover:border-white hover:bg-bubujas-ia hover:text-black hover:cursor-pointer p-1 h-10"
          onClick={() => {
            enviarPost(textUsuario);
            setTextUsuario("");
          }}
        >
          Enviar
        </button>
      </section>
    </div>
  );
}
