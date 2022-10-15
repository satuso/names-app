import React from "react"
import axios from "axios"
import { useState, useEffect } from "react"

let men = require("./data/men.json")
let women = require("./data/women.json")
let all = { ...women, ...men }

const App = () => {
  const [name, setName] = useState("")
  const [display, setDisplay] = useState("")
  const [selected, setSelected] = useState("all")
  const [data, setData] = useState(all)
  const [wiki, setWiki] = useState([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    axios
      .get(`https://fi.wikipedia.org/api/rest_v1/page/summary/${query}`)
      .then(resp => {
        setWiki(resp.data)
      })
      .catch(error => {
        console.log(error.response.data.error)
        setWiki([])
     })
  }, [query])

  let number = 0

  const getIndex = (name) => {
    const names = Object.keys(data)
    return names.indexOf(name.charAt(0).toUpperCase() + name.slice(1)) +1
  }

  const submitForm = (e) => {
    e.preventDefault()
    setQuery(name.charAt(0).toUpperCase() + name.slice(1))
    if (name.length > 0){
      const k = Object.keys(data).find((key) => key.toLowerCase() === name.toLowerCase())
      const key = name.charAt(0).toUpperCase() + name.slice(1)
      const val = data[k]
      setDisplay(
        <tbody key={key}>
          <tr>
          <td>{getIndex(name)}</td>
          <td>{key}</td>
          <td>{val}</td>
          </tr>
        </tbody>
      )
      if (val === undefined){
        setWiki([])
        setDisplay(
          <tbody key={key}>
            <tr>
            <td></td>
            <td>Nimeä ei löydy</td>
            <td></td>
            </tr>
          </tbody>
        )
      }
    }
     else {
      setWiki([])
      setDisplay(
        <tbody>
          <tr>
          <td></td>
          <td>Nimeä ei löydy</td>
          <td></td>
          </tr>
        </tbody>
      )
    }
  }

  const resetForm = (e) => {
    e.preventDefault()
    setName("")
    setDisplay("")
    setWiki([])
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleRadioChange = (e) => {
    setSelected(e.target.value)
    if (e.target.value === "all") {
      setData(all)
      setQuery(name.charAt(0).toUpperCase() + name.slice(1))
    }
    if (e.target.value === "male") {
      setData(men)
      setQuery(name.charAt(0).toUpperCase() + name.slice(1))
    } 
    if (e.target.value === "female") { 
      setData(women)
      setQuery(name.charAt(0).toUpperCase() + name.slice(1))
    }
    setName("")
    setQuery("")
    setDisplay("")
  }

  const getRandomName = (e) => {
    e.preventDefault()
    setName("")
    const rand = (object) => {
      var keys = Object.keys(object)
      const random = Math.floor(keys.length * Math.random())
      setQuery(keys[random].charAt(0).toUpperCase() + keys[random].slice(1))
      return (
      <tbody key={keys[random]}>
        <tr>
        <td>{getIndex(keys[random])}</td>
        <td>{keys[random]}</td>
        <td>{object[keys[random]]}</td>
        </tr>
      </tbody>
      )
    }
    setDisplay(rand(data))
  }

  const getTop10 = (e) => {
    e.preventDefault()
    number = 10
    getTop()
  }

  const getTop50 = (e) => {
    e.preventDefault()
    number = 50
    getTop()
  }

  const getTop100 = (e) => {
    e.preventDefault()
    number = 100
    getTop()
  }

  const getTop = () => {
    var sortedEntries = Object.entries(data).sort(function(a,b){return b[1]-a[1]})
    var last = sortedEntries[number-1][1]
    var result = sortedEntries.filter(function(entry){
        return entry[1] >= last
    })
    const result2 = Object.fromEntries(result)
    setWiki([])
    setDisplay(
      Object.entries(result2).map(([key, value], index) =>
      <tbody key={key}>
        <tr>
        <td>{index+1}</td>
        <td>{key}</td>
        <td>{value}</td>
        </tr>
      </tbody>
      ))
  }

  if (!wiki) return null

  return (
    <>
    <main>
      <h1>Nimihaku</h1>
      <form onSubmit={submitForm} onReset={resetForm}>
        <div className="search">
        <input
          type="text"
          name="name"
          onChange={handleNameChange}
          value={name}
          placeholder="Hae nimeä"
        />
        <button className="input-button" type="submit">🔍</button>
        </div>
        <br />
        <button onClick={getRandomName}>Satunnainen</button>
        <button onClick={getTop10}>Top 10</button>
        <button onClick={getTop50}>Top 50</button>
        <button onClick={getTop100}>Top 100</button>
        <button type="reset">Tyhjennä</button>
        <br/>
        <input 
          type="radio"
          value="all" 
          name="gender"
          checked={selected === "all"}
          onChange={handleRadioChange}
          /> Kaikki
        <input 
          type="radio"
          value="male" 
          name="gender"
          checked={selected === "male"}
          onChange={handleRadioChange}
          /> Mies
        <input 
          type="radio" 
          value="female" 
          name="gender"
          checked={selected === "female"}
          onChange={handleRadioChange}
          /> Nainen
      </form>
        <table>
          <thead>
          <tr>
            <th style={{width: 70}}>#</th>
            <th style={{width: 200}}>Nimi</th>
            <th style={{width: 200}}>Lukumäärä</th>
          </tr>
          </thead>
          {display}
        </table>
      <div>
      <div>
        {wiki && ((wiki.extract?.includes("etunimi") && data === all) || (wiki.extract?.includes("miehen etunimi") && data === men) || (wiki.extract?.includes("naisen etunimi") && data === women)) && 
        <div className="wiki">
          <h2>{wiki.title}</h2>
          <h3>{wiki.description}</h3>
          <p>{wiki.extract}</p>
          {wiki.content_urls?.desktop?.page && <a href={wiki.content_urls?.desktop?.page} target="blank">Lue lisää Wikipediassa</a>}
        </div>}
      </div>
    </div>
</main>
<footer><p>Digi- ja väestötietovirasto (DVV) on julkaissut tietoaineiston Väestötietojärjestelmän suomalaisten nimiaineistot lisenssillä Creative Commons Attribution 4.0 International License. Nimiaineistot on poimittu 7.2.2022.</p></footer>
</>
  )
}
export default App