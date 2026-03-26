import { useState } from "react";

export default function FeedbackItem({ value, i }) {
  //controlador mas
  const [show, setShow] = useState(false);

  function showCorrection() {
    setShow(!show);
  }
  return (
    <>
      <div className="text-[16px] m-1" key={i}>
        <button
          className={`text-[12px] rounded-full p-1 hover:cursor-pointer text-cyan-200/80 hover:bg-blue-950 ${show ? "bg-blue-950" : "bg-blue-950/50"}`}
          onClick={() => {
            showCorrection();
          }}
        >
          {show ? "Hide" : "Show"} Correction {show ? "" : i + 1}
        </button>
        {show ? (
          <>
            <p>
              <strong>{value.error}</strong> <br />
              <i>
                <b>correccion:</b> {value.correction}
              </i>{" "}
              <br />
              <b>
                {value.explanation} {""} {value.suggestion}
              </b>
            </p>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
