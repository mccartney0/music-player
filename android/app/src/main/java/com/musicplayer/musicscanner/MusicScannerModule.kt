package com.musicplayer.musicscanner

import android.content.ContentUris
import android.net.Uri
import android.provider.MediaStore
import com.facebook.react.bridge.*

class MusicScannerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MusicScanner"

    @ReactMethod
    fun getAll(promise: Promise) {
        try {
            val songs = WritableNativeArray()
            val uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.DATA,
                MediaStore.Audio.Media.ALBUM_ID
            )
            val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0 AND ${MediaStore.Audio.Media.DURATION} > 10000"
            val sortOrder = "${MediaStore.Audio.Media.TITLE} ASC"

            val cursor = reactApplicationContext.contentResolver.query(
                uri, projection, selection, null, sortOrder
            )

            cursor?.use {
                val idCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val titleCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                val artistCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                val albumCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                val durationCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                val dataCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
                val albumIdCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)

                while (it.moveToNext()) {
                    val song = WritableNativeMap()
                    val id = it.getLong(idCol)
                    val albumId = it.getLong(albumIdCol)

                    song.putString("id", id.toString())
                    song.putString("title", it.getString(titleCol) ?: "Sem título")
                    song.putString("artist", it.getString(artistCol) ?: "Artista desconhecido")
                    song.putString("album", it.getString(albumCol) ?: "Álbum desconhecido")
                    song.putDouble("duration", it.getLong(durationCol).toDouble())
                    song.putString("path", it.getString(dataCol) ?: "")

                    // Album art URI
                    val albumArtUri = ContentUris.withAppendedId(
                        Uri.parse("content://media/external/audio/albumart"),
                        albumId
                    )
                    song.putString("cover", albumArtUri.toString())

                    songs.pushMap(song)
                }
            }

            promise.resolve(songs)
        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", "Erro ao escanear músicas: ${e.message}", e)
        }
    }
}
