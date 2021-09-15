import React, { useEffect } from 'react'
import {useState} from 'react'


function chunkArray(array, chunkSize) {
  const length = array.length;
  const finalResults = [];
  let tempArray = [];

  for (let i = 0; i < length; i++) {
    tempArray.push(array[i])

    if (tempArray.length === chunkSize) {
      finalResults.push(tempArray)
      tempArray = []
    } else if (i === length - 1) {
      finalResults.push(tempArray)
    }
  }

  return finalResults
}

function reduceArraysToAvg(array) {
  return array.map(arr => arr.reduce((acc, num) => acc + num, 0))
}

function massageArray(arr) {
  const finalNumOfPoints = 100

  // Flip all the negative values positive since we're doing an area chart.
  const channelData = arr.map(Math.abs)

  // Split the data into chunks.
  const chunkSize = Math.ceil(channelData.length / finalNumOfPoints)
  const chunkedArray = chunkArray(channelData, chunkSize)

  // Average out each chunk which will represent one "bar" in the area chart.
  const pointValues = reduceArraysToAvg(chunkedArray)
  const max = pointValues.reduce((acc, num) => num > acc ? num : acc, 0)

  return pointValues.map(val => val / max)
}

const App = () => {
  const [data, setData] = useState({Int8Array: null, Uint8Array: null, AudioContext: null})

  useEffect(() => {
    fetch('episode7.mp3')
      .then(res => res.blob())
      .then(blob => blob.arrayBuffer())
      .then(arrayBuffer => {
        const int8Arr = massageArray(new Int8Array(arrayBuffer))
        const uint8Arr = massageArray(new Uint8Array(arrayBuffer))
        const audioCtx = new AudioContext().decodeAudioData(arrayBuffer)

        return Promise.all([int8Arr, uint8Arr, audioCtx])
      })
      .then(([int8Arr, uint8Arr, audioCtx]) => {
        const audioCtxData = massageArray(audioCtx.getChannelData(0))
        setData({Int8Array: int8Arr, Uint8Array: uint8Arr, AudioContext: audioCtxData})
      })
  }, [])

  return (
    <>
      <header className="pa4 bg-gold black-80">
        <h1 className="ma0">CSS Charts</h1>
      </header>
      <section className="pa4 chart-container">
        {Object.keys(data).map((name, i) => {
          const arr = data[name]

          return (
            <section className="ba-1px pa2 mb6" key={i}>
              <h1 className="ma0">{name}:</h1>
              <ul>
                {arr == null ? 'loading...' : arr.map((end, i) => {
                  const lastVal = i === 0 ? 0 : arr[i - 1]
                  const start = lastVal

                  return <li key={i} style={{'--start': start, '--end': end}}></li>
                })}
              </ul>
            </section>
          )
        })}
      </section>
    </>
  )
}

export default App
