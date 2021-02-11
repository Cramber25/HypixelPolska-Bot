// TAK, WIEM ZE DA SIE ZROBIC BARDZIEJ ZOPTYMALIZOWANY KOD, ALE TO BYL BOT ROBIONY NA SZYBKO POD NOWEGO DISCORDA NASZEJ GILDII XDD
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const config = require('./config.json'); // nie ma tu tego bo tam byly klucze api itp
const ranks = require('./ranks.json'); // polaczenie rang z gildii do rang na dc
client.on('ready', () => {
    console.log(`Bot ${client.user.tag} online!`);
    client.user.setActivity("HypixelPolska"); 
})
client.on("message", message => {
    if(message.channel.id === "806226313660465152" || message.channel.id === "806797347345530881") { // start kodu na zwykłe komendy
        if (!message.content.startsWith(config.prefix) || message.author.bot) return;
        const args = message.content.slice(config.prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        // tak, wiem ze lepiej zrobic system komend ale nie chcialo mi sie dla takiego projektu
        switch(command) {
            default:
                message.reply("nie ma takiej komendy!");
                break;
            case "help":
                // lista komend
                const helpEmbed = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('Lista komend')
                    .setDescription('Poniżej znajduje się lista komend dostępnych w oficjalnym bocie gildii HypixelPolska.')
                    .addFields(
                        { name: '!help', value: 'Wyświetla liste komend.', inline: true },
                        { name: '!ping', value: 'Pokazuje obecny ping.', inline: true },
                        { name: '!gildia', value: 'Wyświetla informacje o gildii.', inline: true },
                        { name: '!gracz <nick>', value: 'Wyświetla informacje o członku gildii.', inline: true },
                        { name: '!aktywni', value: 'Wyświetla nieścisłości w rangach Aktywny.', inline: true },
                    )
                    .setThumbnail(message.guild.iconURL())
                    .setTimestamp()
                    .setFooter(message.member.displayName, 'https://mc-heads.net/avatar/' + message.member.displayName);
                message.channel.send(helpEmbed);
                break;
            case "ping":
                // ping api
                message.channel.send(`Ping API: ${Math.round(client.ws.ping)}ms`);
                break;
            case "gildia":
                // informacje o gildii
                var request = require('request');
                var url = `https://api.hypixel.net/guild?key=${config.apikey}&id=${config.guildid}`;
                request.get({
                    url: url,
                    json: true,
                    headers: {'User-Agent': 'request'}
                    }, (err, res, data) => {
                    if (err) {
                        console.log('Error:', err);
                    } else if (res.statusCode !== 200) {
                        console.log('Status:', res.statusCode);
                    } else {
                        var list = new Object(data.guild.guildExpByGameType)
                        keysSorted = Object.keys(list).sort(function(a,b){return list[a]-list[b]})
                        function getLevel(exp) {
                            // obliczanie xp/levelu gildii, kod podjebany bo nie wiedzialem jak dokladnie dziala system leveli na hypixelu
                            const EXP_NEEDED = [
                              100000,
                              150000,
                              250000,
                              500000,
                              750000,
                              1000000,
                              1250000,
                              1500000,
                              2000000,
                              2500000,
                              2500000,
                              2500000,
                              2500000,
                              2500000,
                              3000000,
                            ];
                            let level = 0;
                            for (let i = 0; i <= 1000; i += 1) {
                              let need = 0;
                              if (i >= EXP_NEEDED.length) {
                                need = EXP_NEEDED[EXP_NEEDED.length - 1];
                              } else { need = EXP_NEEDED[i]; }
                              if ((exp - need) < 0) {
                                return Math.round((level + (exp / need)) * 100) / 100;
                              }
                              level += 1;
                              exp -= need;
                            }
                            return 1000;
                          }
                          // embed informacji o gildii
                        const gildiaEmbed = new Discord.MessageEmbed()
                            .setColor('#ff0000')
                            .setTitle('Infomacje o gildii')
                            .setDescription('Poniżej znajdują się informacje o gildii HypixelPolska.')
                            .addFields(
                                { name: 'Nazwa', value: data.guild.name, inline: true },
                                { name: 'Opis', value: data.guild.description, inline: true },
                                { name: 'Tag', value: data.guild.tag, inline: true },
                            )
                            .addField('Ulubione gry', `1. ${keysSorted[25]}\n2. ${keysSorted[24]}\n3. ${keysSorted[23]}\n4. ${keysSorted[22]}\n5. ${keysSorted[21]}`, true)
                            .addField('Członków', Object.keys(data.guild.members).length, true)
                            .addField('Level', Math.round(getLevel(data.guild.exp)), true)
                            .setThumbnail(message.guild.iconURL())
                            .setTimestamp()
                            .setFooter(message.member.displayName, 'https://mc-heads.net/avatar/' + message.member.displayName);
                        message.channel.send(gildiaEmbed);
                    }
                });
                break;
            case "gracz":
                // komenda informacji o członku gildii
                var nick = '';
                if(args[0]) {
                    nick = args[0];
                }else {
                    nick = message.member.displayName;
                }
                var request = require('request');
                var url = `https://api.mojang.com/users/profiles/minecraft/` + nick;
                request.get({
                    url: url,
                    json: true,
                    headers: {'User-Agent': 'request'}
                    }, (err, res, data) => {
                    if (err) {
                        console.log('Error:', err);
                    } else if (res.statusCode !== 200) {
                        console.log('Status mojang:', res.statusCode);
                        message.reply('taki gracz nie istnieje!');
                    } else {
                        var uuid = data.id;
                        var request = require('request');
                        var url = `https://api.hypixel.net/guild?key=${config.apikey}&id=${config.guildid}`;
                        request.get({
                            url: url,
                            json: true,
                            headers: {'User-Agent': 'request'}
                            }, (err, res, data) => {
                            if (err) {
                                console.log('Error:', err);
                            } else if (res.statusCode !== 200) {
                                console.log('Status guild:', res.statusCode);
                            } else {
                                // array gracza z gildii
                                var guilddata = data.guild.members.find(el => el.uuid == uuid)
                                if(guilddata == undefined) return message.reply('taki gracz nie znajduje sie w gildii!'); 
                                var request = require('request');
                                var url = `https://api.hypixel.net/player?key=${config.apikey}&uuid=${uuid}`;
                                request.get({
                                    url: url,
                                    json: true,
                                    headers: {'User-Agent': 'request'}
                                    }, (err, res, data) => {
                                    if (err) {
                                        console.log('Error:', err);
                                    } else if (res.statusCode !== 200) {
                                        console.log('Status player:', res.statusCode);
                                    } else {
                                        // array gracza
                                        var playerdata = data;
                                        var request = require('request');
                                        var url = `https://api.hypixel.net/status?key=${config.apikey}&uuid=${uuid}`;
                                        request.get({
                                            url: url,
                                            json: true,
                                            headers: {'User-Agent': 'request'}
                                            }, (err, res, data) => {
                                            if (err) {
                                                console.log('Error:', err);
                                            } else if (res.statusCode !== 200) {
                                                console.log('Status status:', res.statusCode);
                                            } else {
                                                // array status
                                                var statusdata = data;
                                                let rank = '';
                                                if (playerdata.player.rank) {
                                                    rank = playerdata.player.rank;
                                                } else if (playerdata.player.monthlyPackageRank && playerdata.player.monthlyPackageRank !== 'NONE') {
                                                    rank = 'MVP++'
                                                } else if (playerdata.player.newPackageRank) {
                                                    rank = playerdata.player.newPackageRank.replace('_PLUS', '+');
                                                } else {
                                                    rank = 'Gracz';
                                                }
                                                var networkLevel = (Math.sqrt((2 * playerdata.player.networkExp) + 30625) / 50) - 2.5;
                                                var historiaxp = Object.values(guilddata.expHistory);
                                                function isBigEnough(value) {
                                                    return value >= config.wymaganeexp;
                                                }
                                                var aktywnexp = historiaxp.filter(isBigEnough);
                                                var aktywny = "";
                                                if(aktywnexp.length >= config.wymaganeexpdzien) {
                                                    aktywny = "TAK";
                                                }else {
                                                    aktywny = "NIE";
                                                }
                                                var online = '';
                                                var tryb = '';
                                                if(statusdata.session.online == true) {
                                                    online = "TAK";
                                                    tryb = statusdata.session.gameType;
                                                }else {
                                                    online = "NIE";
                                                    tryb = "BRAK";
                                                }
                                                // embed informacji o członku
                                                const playerEmbed = new Discord.MessageEmbed()
                                                .setColor('#ff0000')
                                                .setTitle('Infomacje o graczu')
                                                .setDescription('Poniżej znajdują się informacje o członku gildii HypixelPolska.')
                                                .addFields(
                                                    { name: 'Gracz', value: "`[" + rank + "] " + playerdata.player.displayname + "`", inline: true },
                                                    { name: 'Level', value: Math.round(networkLevel), inline: true },
                                                    { name: 'Online', value: online, inline: true },
                                                    { name: 'Gildyjna ranga', value: guilddata.rank, inline: true },
                                                    { name: 'Spełnia wymagania', value: aktywny, inline: true },
                                                    { name: 'Tryb', value: tryb, inline: true },
                                                )
                                                .addField('Tygodniowy XP', historiaxp)
                                                .setThumbnail(`https://mc-heads.net/avatar/` + playerdata.player.displayname)
                                                .setTimestamp()
                                                .setFooter(message.member.displayName, 'https://mc-heads.net/avatar/' + message.member.displayName);
                                                message.channel.send(playerEmbed);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
                break;
            case "aktywni":
                // komenda na wyswietlenie listy niezgodnosci w randze aktywny (taki tam bajer ulatwiajacy oddzielanie bardzo aktywnych od tych mniej)
                var request = require('request');
                var url = `https://api.hypixel.net/guild?key=${config.apikey}&id=${config.guildid}`;
                request.get({
                    url: url,
                    json: true,
                    headers: {'User-Agent': 'request'}
                    }, (err, res, data) => {
                    if (err) {
                        console.log('Error:', err);
                    } else if (res.statusCode !== 200) {
                        console.log('Status:', res.statusCode);
                    } else {
                        var list = data.guild.members;
                        var niemaja = '';
                        var maja = '';
                        list.forEach(element => {
                            function isBigEnough(value) {
                                return value >= config.wymaganeexp;
                            }
                            var aktywnexp = Object.values(element.expHistory).filter(isBigEnough);
                            if(aktywnexp.length >= config.wymaganeexpdzien) {
                                if(element.rank !== "Member") return;
                                var request = require('request');
                                var url = `https://sessionserver.mojang.com/session/minecraft/profile/` + element.uuid;
                                request.get({
                                    url: url,
                                    json: true,
                                    headers: {'User-Agent': 'request'}
                                    }, (err, res, data) => {
                                    if (err) {
                                        console.log('Error:', err);
                                    } else if (res.statusCode !== 200) {
                                        console.log('Status mojang:', res.statusCode);
                                        message.reply('taki gracz nie istnieje!');
                                    } else {
                                        niemaja += "- `" + data.name + "`\n";
                                    }
                                })
                            }else {
                                if(element.rank !== "Aktywny") return;
                                var request = require('request');
                                var url = `https://sessionserver.mojang.com/session/minecraft/profile/` + element.uuid;
                                request.get({
                                    url: url,
                                    json: true,
                                    headers: {'User-Agent': 'request'}
                                    }, (err, res, data) => {
                                    if (err) {
                                        console.log('Error:', err);
                                    } else if (res.statusCode !== 200) {
                                        console.log('Status mojang:', res.statusCode);
                                        message.reply('taki gracz nie istnieje!');
                                    } else {
                                        maja += "- `" + data.name + "`\n";
                                    }
                                })
                            }
                        });
                        function poWyszukaniu() {
                            if(maja == '') {
                                maja = "BRAK";
                            }
                            if(niemaja == '') {
                                niemaja = "BRAK";
                            }
                            const aktywniEmbed = new Discord.MessageEmbed()
                                .setColor('#ff0000')
                                .setTitle('Aktywni')
                                .setDescription('Poniżej znajduje się lista nieścisłości w rangach Aktywny. (wymagania: ' + config.wymaganeexpdzien + ' razy w ciągu tygodnia przekroczyć ' + config.wymaganeexp + 'xp)')
                                .addFields(
                                    { name: 'Nie mają a powinni mieć', value: niemaja, inline: true },
                                    { name: 'Mają a nie powinni mieć', value: maja, inline: true },
                                )
                                .setThumbnail(message.guild.iconURL())
                                .setTimestamp()
                                .setFooter(message.member.displayName, 'https://mc-heads.net/avatar/' + message.member.displayName);
                            message.channel.send(aktywniEmbed);
                        }
                        setTimeout(poWyszukaniu, 1500);
                    }
                });
                break;
        }
    }else if(message.channel.id === "804748934119161916") {
        // system weryfikacji kont na hypixel
        if (!message.content.startsWith(config.prefix) || message.author.bot) return;
        const args = message.content.slice(config.prefix.length).trim().split(' ');
        const nick = args.shift().toLowerCase();
        if(nick.length < 3 || nick.length > 20) return message.reply('to nie jest poprawny nick.');
        var request = require('request');
        var url = `https://api.mojang.com/users/profiles/minecraft/` + nick;
        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
            }, (err, res, data) => {
            if (err) {
                console.log('Error:', err);
            } else if (res.statusCode !== 200) {
                console.log('Status mojang:', res.statusCode);
                message.reply('to nie jest poprawny nick.');
            } else {
                var uuid = data.id;
                var name = data.name;
                var request = require('request');
                var url = `https://api.hypixel.net/guild?key=${config.apikey}&id=${config.guildid}`;
                request.get({
                    url: url,
                    json: true,
                    headers: {'User-Agent': 'request'}
                    }, (err, res, data) => {
                    if (err) {
                        console.log('Error:', err);
                    } else if (res.statusCode !== 200) {
                        console.log('Status:', res.statusCode);
                    } else {
                        var guilddata = data.guild.members.find(el => el.uuid == uuid)
                        if(guilddata == undefined) return message.reply('ten gracz nie znajduje sie w gildii HypixelPolska!'); 
                        var request = require('request');
                        var url = `https://api.hypixel.net/status?key=${config.apikey}&uuid=${uuid}`;
                        request.get({
                            url: url,
                            json: true,
                            headers: {'User-Agent': 'request'}
                            }, (err, res, data) => {
                            if (err) {
                                console.log('Error:', err);
                            } else if (res.statusCode !== 200) {
                                console.log('Status status:', res.statusCode);
                            } else {
                                // array status
                                var statusdata = data;
                                if(statusdata.session.online == false) return message.reply("aby potwierdzić że to twoje konto, wejdź na serwer Hypixel i ponownie wpisz tą komende.")
                                if(statusdata.session.gameType !== "SUPER_SMASH" || statusdata.session.mode !== "LOBBY") return message.reply("aby potwierdzić że to twoje konto, wejdź na lobby trybu Smash Heroes i ponownie wpisz tą komende.")
                                var rangii = "";
                                if(guilddata.rank !== "Member") {
                                    rangii = `${guilddata.rank} + Członek`;
                                    message.member.roles.add(message.guild.roles.cache.get(ranks[guilddata.rank]));
                                    message.member.roles.add(message.guild.roles.cache.get(ranks['Member']));
                                }else {
                                    rangii = "Członek";
                                    message.member.roles.add(message.guild.roles.cache.get(ranks['Member']));
                                }
                                message.member.setNickname(name);
                                const weryfikacjaEmbed = new Discord.MessageEmbed()
                                    .setColor('#ff0000')
                                    .setTitle('Zweryfikowano ✅')
                                    .setDescription(`Użytkownik ${message.member} został zweryfikowany!`)
                                    .addFields(
                                        { name: 'Nick', value: "`" + name + "`", inline: true },
                                        { name: 'Rangi', value: rangii, inline: true },
                                        { name: 'UUID', value: uuid, inline: true },
                                    )
                                    .setThumbnail('https://mc-heads.net/avatar/' + nick)
                                    .setTimestamp()
                                    .setFooter('System weryfikacji by Cramber', 'https://mc-heads.net/avatar/Cramber');
                                message.channel.send(weryfikacjaEmbed);
                                const members = require('./members.json'); // na taki maly projekt nie chcialo mi sie robic realnej bazy danych
                                if(members[message.author.id] !== undefined) {
                                    delete members[message.author.id];
                                }
                                members[message.author.id] = uuid;
                                fs.writeFile("members.json", JSON.stringify(members), 'utf8', function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                            }
                        })
                    }
                })
            }
        })
    }
    return;
})
client.login(config.token);