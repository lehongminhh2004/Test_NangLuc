/* eslint-disable */
// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import HomePage from '../../src/app/(frontend)/page'

// Mock the fetch API
global.fetch = vi.fn()

describe('HomePage Component', () => {
  const mockTodos = [
    { id: 1, title: 'Test Task 1', completed: false, date: '2026-07-06' },
    { id: 2, title: 'Test Task 2', completed: true, date: '2026-07-06' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      json: async () => ({ docs: mockTodos }),
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the title and loads initial tasks', async () => {
    render(<HomePage />)
    
    // Check if header exists
    expect(screen.getByText('Quản lý công việc')).toBeDefined()
    
    // Wait for the tasks to be loaded via fetch
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeDefined()
      expect(screen.getByText('Test Task 2')).toBeDefined()
    })
  })

  it('allows adding a new task', async () => {
    render(<HomePage />)
    
    // Wait for initial load
    await waitFor(() => expect(screen.getByText('Test Task 1')).toBeDefined())

    // Mock fetch for POST request
    ;(global.fetch as any).mockImplementationOnce(() => 
      Promise.resolve({
        json: async () => ({
          doc: { id: 3, title: 'New Unit Test Task', completed: false, date: '2026-07-06' }
        })
      })
    )

    const input = screen.getByPlaceholderText('Thêm công việc mới')
    const submitBtn = screen.getByText('Thêm')

    fireEvent.change(input, { target: { value: 'New Unit Test Task' } })
    expect((input as HTMLInputElement).value).toBe('New Unit Test Task')
    
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('New Unit Test Task')).toBeDefined()
    })
  })

  it('filters tasks correctly', async () => {
    render(<HomePage />)
    await waitFor(() => expect(screen.getByText('Test Task 1')).toBeDefined())

    // Click "Chưa xong"
    fireEvent.click(screen.getByText('Chưa xong'))
    
    // Test Task 1 is incomplete, Test Task 2 is complete
    expect(screen.getByText('Test Task 1')).toBeDefined()
    expect(screen.queryByText('Test Task 2')).toBeNull()

    // Click "Đã xong"
    fireEvent.click(screen.getByText('Đã xong'))
    expect(screen.queryByText('Test Task 1')).toBeNull()
    expect(screen.getByText('Test Task 2')).toBeDefined()
  })

  it('searches tasks correctly', async () => {
    render(<HomePage />)
    await waitFor(() => expect(screen.getByText('Test Task 1')).toBeDefined())

    const searchInput = screen.getByPlaceholderText('Tìm kiếm')
    fireEvent.change(searchInput, { target: { value: 'Task 1' } })

    expect(screen.getByText('Test Task 1')).toBeDefined()
    expect(screen.queryByText('Test Task 2')).toBeNull()
  })
})
