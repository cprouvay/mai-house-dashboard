'use client'
import { useState } from 'react'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

interface HeaderProps {
  mesActual: number
  anioActual: number
  onCambiarMes: (mes: number, anio: number) => void
  ultimaActualizacion?: string
}

export default function Header({ mesActual, anioActual, onCambiarMes, ultimaActualizacion }: HeaderProps) {

  const irAnterior = () => {
    if (mesActual === 1) onCambiarMes(12, anioActual - 1)
    else onCambiarMes(mesActual - 1, anioActual)
  }

  const irSiguiente = () => {
    const hoy = new Date()
    if (anioActual === hoy.getFullYear() && mesActual === hoy.getMonth() + 1) return
    if (mesActual === 12) onCambiarMes(1, anioActual + 1)
    else onCambiarMes(mesActual + 1, anioActual)
  }

  const esMesActual = () => {
    const hoy = new Date()
    return anioActual === hoy.getFullYear() && mesActual === hoy.getMonth() + 1
  }

  return (
    <header style={{
      background: 'linear-gradient(135deg, #EBF4FA 0%, #F0EDF8 55%, #FDF8F4 100%)',
      borderRadius: 20, border: '1px solid #D2E9F5',
      padding: '1rem 1.5rem', marginBottom: '1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(126,184,212,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#B8D6E8', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>🍵</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1A2332' }}>
            MAI House Café
          </div>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            Av. Nueva Providencia 2212 · Local 216
            {ultimaActualizacion ? (
              <span style={{
                background: '#E8F5EE', color: '#2D7A56',
                borderRadius: 20, padding: '2px 8px', fontSize: 11,
                fontWeight: 500,
              }}>
                ● Actualizado {ultimaActualizacion}
              </span>
            ) : (
              <span style={{
                background: '#EBF4FA', color: '#718096',
                borderRadius: 20, padding: '2px 8px', fontSize: 11,
              }}>
                Cargando...
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={irAnterior} style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '1px solid #B8D6E8', background: 'white',
          cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>

        <div style={{
          background: '#B8D6E8', borderRadius: 12,
          padding: '6px 20px', fontWeight: 700,
          fontSize: 15, color: '#2D3748',
          minWidth: 130, textAlign: 'center',
        }}>
          {MESES[mesActual - 1]} {anioActual}
          {esMesActual() && (
            <span style={{ display: 'block', fontSize: 10, color: '#718096', fontWeight: 400 }}>
              mes actual
            </span>
          )}
        </div>

        <button onClick={irSiguiente} disabled={esMesActual()} style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '1px solid #B8D6E8',
          background: esMesActual() ? '#EBF4FA' : 'white',
          cursor: esMesActual() ? 'not-allowed' : 'pointer',
          fontSize: 18, opacity: esMesActual() ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>›</button>
      </div>
    </header>
  )
}
