'use client'
// ============================================================
// MAI House Café — Header (components/Header.tsx)
// ============================================================
import { useState } from 'react'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

interface HeaderProps {
  mesActual: number
  anioActual: number
  onCambiarMes: (mes: number, anio: number) => void
  ultimaActualizacion?: string
}

export default function Header({
  mesActual, anioActual, onCambiarMes, ultimaActualizacion
}: HeaderProps) {

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
      borderRadius: '20px',
      border: '1px solid var(--mai-blue-100)',
      padding: '1rem 1.5rem',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--mai-shadow)',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--mai-blue-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, boxShadow: 'var(--mai-shadow)',
        }}>🍵</div>
        <div>
          <div style={{
            fontSize: 18, fontWeight: 700,
            color: 'var(--mai-text-900)',
            letterSpacing: '-0.01em',
          }}>
            MAI House Café
          </div>
          <div style={{ fontSize: 12, color: 'var(--mai-text-500)', marginTop: 2 }}>
            Av. Nueva Providencia 2212 · Local 216
            {ultimaActualizacion && (
              <span style={{
                marginLeft: 8,
                background: '#E8F5EE', color: '#2D7A56',
                borderRadius: 20, padding: '1px 8px', fontSize: 11,
              }}>
                ● Actualizado hoy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navegación de mes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={irAnterior}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid var(--mai-blue-200)',
            background: 'white', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>

        <div style={{
          background: 'var(--mai-blue-200)',
          borderRadius: 12, padding: '6px 20px',
          fontWeight: 700, fontSize: 15,
          color: 'var(--mai-text-700)',
          minWidth: 130, textAlign: 'center',
        }}>
          {MESES[mesActual - 1]} {anioActual}
          {esMesActual() && (
            <span style={{
              display: 'block', fontSize: 10,
              color: 'var(--mai-text-500)', fontWeight: 400,
            }}>mes actual</span>
          )}
        </div>

        <button
          onClick={irSiguiente}
          disabled={esMesActual()}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid var(--mai-blue-200)',
            background: esMesActual() ? 'var(--mai-blue-50)' : 'white',
            cursor: esMesActual() ? 'not-allowed' : 'pointer',
            fontSize: 16, opacity: esMesActual() ? 0.4 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      </div>
    </header>
  )
}
