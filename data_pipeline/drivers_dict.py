def format_names(series):
    '''
    Remove special characters from a series of names
    
    :param series: Pandas series of player names
    :return: List of unique names
    '''
    def switcher(argument):
        switcher = {
            'René Arnoux': 'Rene Arnoux', 
            'Élie Bayol': 'Elie Bayol',
            'Éric Bernard': 'Eric Bernard',
            'Sébastien Bourdais': 'Sebastien Bourdais',
            'Sébastien Buemi': 'Sebastien Buemi',
            'Mário de Araújo Cabral': 'Mario de Araujo Cabral',
            'Adrián Campos': 'Adrian Campos',
            'François Cevert':'Francois Cevert',
            'Eugène Chaboud': 'Eugene Chaboud',
            'Érik Comas': 'Erik Comas',
            "Jérôme d'Ambrosio": "Jerome d'Ambrosio",
            'Jean-Denis Délétraz' : 'Jean-Denis Deletraz',
            'José Dolhem':'Jose Dolhem',
            'Tomáš Enge': 'Tomas Enge',
            'Nasif Estéfano': 'Nasif Estefano',
            'Philippe Étancelin': 'Philippe Etancelin',
            'Paul Frère': 'Paul Frere',
            'Oscar Gálvez': 'Oscar Galvez',
            'Marc Gené': 'Marc Gene',
            'José Froilán González':'Jose Froilan Gonzalez',
            'Óscar González': 'Oscar Gonzalez',
            'André Guelfi': 'Andre Guelfi',
            'Miguel Ángel Guerra': "Miguel Angel Guerra",
            'Esteban Gutiérrez': "Esteban Gutierrez",
            'Mika Häkkinen': 'Mika Hakkinen',
            'François Hesnault': 'Francois Hesnault',
            'Nico Hülkenberg': 'Nico Hulkenberg',
            'Jesús Iglesias': 'Jesus Iglesias,',
            'Jyrki Järvilehto': 'Jyrki Jarvilehto',
            'Gérard Larrousse': 'Gerard Larrousse',
            'Michel Leclère': 'Michel Leclere',
            'Ricardo Londoño': 'Ricardo Londono',
            'André Lotterer': 'Andre Lotterer',
            'Onofre Marimón': 'Onofre Marimon',
            'Eugène Martin':' Eugene Martin',
            'François Mazet': 'François Mazet,',
            'Gastón Mazzacane': 'Gaston Mazzacane',
            'François Migault': 'Francois Migault',
            'André Milhoux': 'Andre Milhoux',
            'Patrick Nève': 'Patrick Neve',
            'Sergio Pérez': 'Sergio Perez',
            'Luis Pérez-Sala': 'Luis Perez-Sala',
            'Alfredo Pián': 'Alfredo Pian',
            'François Picard': 'Francois Picard', 
            'André Pilette': 'Andre Pilette',
            'Antônio Pizzonia':'Antonio Pizzonia',
            'Kimi Räikkönen': 'Kimi Raikkonen',
            'Stéphane Sarrazin': 'Stephane Sarrazin',
            'André Simon': 'Andre Simon',
            'Moisés Solana': 'Moises Solana',
            'André Testut': 'Andre Testut',
            'Jean-Éric Vergne': 'Jean-Eric Vergne',
            'Desiré Wilson': 'Desire Wilson',
        }

        # get() method of dictionary data type returns 
        # value of passed argument if it is present 
        # in dictionary otherwise second argument will
        # be assigned as default value of passed argument
        val = switcher.get(argument, "nothing")
        if val == "nothing":
            return argument
        else:
            return val
    
    lst = []
    for idx, item in enumerate(series): 
        lst.append(switcher(item))
    return(lst)