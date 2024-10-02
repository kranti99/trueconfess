'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { getAuth } from 'firebase/auth'
import { addDoc, collection, serverTimestamp, updateDoc, doc, increment, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useRouter } from 'next/navigation'
import PropTypes from 'prop-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Toast, ToastProvider } from '@/components/ui/toast'
import { AlertCircle, CheckCircle } from 'lucide-react'
import * as Emoji from 'quill-emoji'
import 'quill-emoji/dist/quill-emoji.css'
import 'react-quill/dist/quill.bubble.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function CommentForm({ confessionId, replyTo }) {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [user, setUser] = useState(null)
  const [confessionAnonymous, setConfessionAnonymous] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const auth = getAuth()
  const MAX_WORD_COUNT = 200
  const MAX_SINGLE_WORD_LENGTH = 50

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [auth])

  useEffect(() => {
    const fetchConfession = async () => {
      const confessionDoc = await getDoc(doc(db, 'confessions', confessionId))
      if (confessionDoc.exists()) {
        const confessionData = confessionDoc.data()
        setConfessionAnonymous(confessionData.isAnonymous || false)
      }
    }

    fetchConfession()
  }, [confessionId])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const Quill = require('react-quill').Quill
      Quill.register('modules/emoji', Emoji)
    }
  }, [])

  const validateComment = () => {
    const wordCount = content.trim().split(/\s+/).length
    if (wordCount > MAX_WORD_COUNT) {
      setErrorMessage(`Comment exceeds the maximum word limit of ${MAX_WORD_COUNT} words.`)
      return false
    }

    const words = content.trim().split(/\s+/)
    for (let word of words) {
      if (word.length > MAX_SINGLE_WORD_LENGTH) {
        setErrorMessage(`Single word exceeds the maximum length of ${MAX_SINGLE_WORD_LENGTH} characters.`)
        return false
      }
    }

    if (!content.trim()) {
      setErrorMessage('Comment cannot be empty.')
      return false
    }

    return true
  }

  const publishComment = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!validateComment()) {
      return
    }

    try {
      await addDoc(collection(db, 'confessions', confessionId, 'comments'), {
        content,
        date: serverTimestamp(),
        userId: user.uid,
        nickname: confessionAnonymous ? 'Anonymous' : user.displayName,
        replyTo: replyTo || null,
      })
      await updateDoc(doc(db, 'confessions', confessionId), {
        commentCount: increment(1),
      })
      setContent('')
      setIsFocused(false)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      console.error('Error adding comment: ', error)
      setErrorMessage('Failed to post comment. Please try again.')
    }
  }

  const modules = {
    'emoji-toolbar': true,
    'emoji-textarea': true,
    'emoji-shortname': true,
    toolbar: [
      ['bold', 'italic'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['emoji'],
    ],
  }

  return (
    <ToastProvider>
      <Card className="bg-transparent text-white">
        <CardContent className="p-4">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <ReactQuill
                theme="bubble"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Add a comment..."
                className="text-white placeholder-muted-foreground rounded"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(content ? true : false)}
              />
              {isFocused && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Max {MAX_WORD_COUNT} words</span>
                  <Button onClick={publishComment} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                    Publish
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        {errorMessage && (
          <Toast variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{errorMessage}</p>
          </Toast>
        )}
        {showSuccessMessage && (
          <Toast>
            <CheckCircle className="h-4 w-4" />
            <p>Comment posted successfully!</p>
          </Toast>
        )}
      </Card>
    </ToastProvider>
  )
}

CommentForm.propTypes = {
  confessionId: PropTypes.string.isRequired,
  replyTo: PropTypes.string,
}
