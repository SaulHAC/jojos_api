const PORT = 9001
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const jojoPart = {
    name : '',
    characters : []
}

const character = {
    name : '',
    japaneseName : '',
    gender : '',
    nationality : '',
    stands : [],
    abilities : [],
    image : '',
    description : ''
}

const stand = {
    name : '',
    japaneseName : '',
    user : '',
    type : [],
    techniques : [],
    image : ''
}

app.get('/', (req, res) => {
    res.json('Welcome to this Bizarre API')
})

app.get('/arc_characters/:part', (req, res) => {
    const partId = req.params.part

    axios.get(`https://jojowiki.com/Category:Part_${partId}_Characters`)
    .then((response) => {
        const html = response.data
        const $ = cheerio.load(html)

        jojoPart.name = ''
        jojoPart.characters.length = 0

        if(partId == 1){
            jojoPart.name = "Phantom Blood"
        } else {
            $('p:contains("These are the characters featured in")').each(function() {
                const title = $(this).find('a').text()
                jojoPart.name = title
            })
        }

        $('div.charname', html).each(function () {
            const title = $(this).text()
            const url = $(this).find('a').attr('href')
            jojoPart.characters.push({
                title,
                api_url : '/character_detail' + url
            })
        })
        res.json(jojoPart)
    }).catch((err) => console.log(err))
})

app.get('/character_detail/:character', (req, res) => {
    const characterId = req.params.character
    const characterName = characterId.replace(/_/g, ' ')

    axios.get(`https://jojowiki.com/${characterId}`)
    .then((response) => {
        const html = response.data
        const $ = cheerio.load(html)

        character.abilities.length = 0
        character.stands.length = 0

        $('h2[data-source="title"]').each(function() {
            const name = $(this).text()
            character.name = name
        })

        $('span.t_nihongo_kanji').each(function() {
            const japaneseName = $(this).text()
            character.japaneseName = japaneseName
        })

        $('div[data-source="gender"]').each(function() {
            const gender = $(this).find('div').text()
            character.gender = gender.split(' ')[0]
        })

        $('div[data-source="nation"]').each(function() {
            const nationality = $(this).find('h3').text()
            character.nationality = nationality.split(' ')[0]
        })

        $('div.techTitle').each(function() {
            const ability = $(this).text()
            character.abilities.push(ability)
        })

        $('div.abilityname').each(function() {
            const stand = $(this).text()
            const stand_url = $(this).find('a').attr('href')
            character.stands.push({
                stand: stand,
                api_url : '/stand' + stand_url
            })
        })

        $('div[data-source="image"]').each(function() {
            const image = $(this).find('img').attr('src')
            character.image = image
        })

        $(`p:not([class]):not([id]):not([style]):contains("${characterName}"):first`).each(function() {
            const description = $(this).text()
            character.description = description
        });

        res.json(character)
    }).catch((err) => console.log(err))
})

app.get('/stand/:standId', (req, res) => {
    const standId = req.params.standId

    axios.get(`https://jojowiki.com/${standId}`)
    .then((response) => {
        const html = response.data
        const $ = cheerio.load(html)

        stand.type.length = 0
        stand.techniques.length = 0

        $('span.mw-page-title-main').each(function() {
            const name = $(this).text()
            stand.name = name
        })

        $('span.t_nihongo_kanji').each(function() {
            const japaneseName = $(this).text()
            stand.japaneseName = japaneseName
        })

        $('div[data-source="user"]').each(function() {
            const user = $(this).text()
            stand.user = user
        })

        $('a[title="Stand Types"]').each(function() {
            const type = $(this).text()
            if (type != "Type") {
                stand.type.push(type)
            }
        })

        $('div.techTitle').each(function() {
            const technique = $(this).text()
            stand.techniques.push(technique)
        })

        $('a.image').eq(0).each(function() {
            const image = $(this).find('img').attr('src')
            stand.image = image
        })

        res.json(stand)
    }).catch((err) => console.log(err))
})


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))