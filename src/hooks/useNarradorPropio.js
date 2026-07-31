import { useState, useRef } from 'react';

export function useNarradorPropio() {
  const [estado, setEstado] = useState('detenido'); // 'reproduciendo' | 'pausado' | 'detenido'
  
  // Guardamos las oraciones y el índice actual
  const oracionesRef = useRef([]);
  const indiceRef = useRef(0);
  const synthRef = useRef(window.speechSynthesis);

  // Función que lee una oración individual
  const leerOracionActual = () => {
    const synth = synthRef.current;
    
    // Si llegamos al final del texto, detenemos todo
    if (indiceRef.current >= oracionesRef.current.length) {
      setEstado('detenido');
      indiceRef.current = 0;
      return;
    }

    const textoOracion = oracionesRef.current[indiceRef.current];
    const utterance = new SpeechSynthesisUtterance(textoOracion);
    utterance.lang = 'es-ES';

    // Al terminar ESTA oración, pasamos a la siguiente automáticamente
    utterance.onend = () => {
      indiceRef.current += 1;
      leerOracionActual(); // Llamada recursiva a la siguiente frase
    };

    synth.speak(utterance);
  };

  // 1. REPRODUCIR DESDE EL INICIO
  const reproducir = (textoCompleto) => {
    synthRef.current.cancel(); // Limpia lecturas anteriores
    
    // Partimos el texto en oraciones pequeñas usando puntos, comas o saltos de línea
    oracionesRef.current = textoCompleto.match(/[^.!?]+[.!?]+/g) || [textoCompleto];
    indiceRef.current = 0;
    
    setEstado('reproduciendo');
    leerOracionActual();
  };

  // 2. PAUSAR (Detiene el audio inmediatamente pero GUARDA el número de oración)
  const pausar = () => {
    synthRef.current.cancel(); // Corta el audio en seco
    setEstado('pausado');
  };

  // 3. CONTINUAR (Retoma exactamente desde la oración donde te quedaste)
  const continuar = () => {
    setEstado('reproduciendo');
    leerOracionActual(); // Inicia a hablar desde indiceRef.current
  };

  // 4. DETENER (Resetea todo)
  const detener = () => {
    synthRef.current.cancel();
    indiceRef.current = 0;
    setEstado('detenido');
  };

  return { estado, reproducir, pausar, continuar, detener };
}