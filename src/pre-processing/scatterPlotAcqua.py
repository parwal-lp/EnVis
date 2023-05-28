import numpy as np
import pandas as pd

liguria = pd.read_csv('data/original/acqua_regioni/liguria.csv')
molise = pd.read_csv('data/original/acqua_regioni/molise.csv')
abruzzo = pd.read_csv('data/original/acqua_regioni/abruzzo.csv')
basilicata = pd.read_csv('data/original/acqua_regioni/basilicata.csv')
bolzano = pd.read_csv('data/original/acqua_regioni/bolzano.csv')
emilia = pd.read_csv('data/original/acqua_regioni/emilia.csv')
friuli = pd.read_csv('data/original/acqua_regioni/friuli.csv')
lazio = pd.read_csv('data/original/acqua_regioni/lazio.csv')
lombardia = pd.read_csv('data/original/acqua_regioni/lombardia.csv')
marche = pd.read_csv('data/original/acqua_regioni/marche.csv')
piemonte = pd.read_csv('data/original/acqua_regioni/piemonte.csv')
puglia = pd.read_csv('data/original/acqua_regioni/puglia.csv')
sardegna = pd.read_csv('data/original/acqua_regioni/sardegna.csv')
sicilia = pd.read_csv('data/original/acqua_regioni/sicilia.csv')
toscana = pd.read_csv('data/original/acqua_regioni/toscana.csv')
trento = pd.read_csv('data/original/acqua_regioni/trento.csv')
umbria = pd.read_csv('data/original/acqua_regioni/umbria.csv')
veneto = pd.read_csv('data/original/acqua_regioni/veneto.csv')

italia = pd.read_csv('data/original/stazioni_superficiali.csv')

liguria = liguria.append(molise)
liguria = liguria.append(abruzzo)
liguria = liguria.append(basilicata)
liguria = liguria.append(bolzano)
liguria = liguria.append(emilia)
liguria = liguria.append(friuli)
liguria = liguria.append(lazio)
liguria = liguria.append(lombardia)
liguria = liguria.append(marche)
liguria = liguria.append(piemonte)
liguria = liguria.append(puglia)
liguria = liguria.append(sardegna)
liguria = liguria.append(sicilia)
liguria = liguria.append(toscana)
liguria = liguria.append(trento)
liguria = liguria.append(umbria)
liguria = liguria.append(veneto)

liguria.rename(columns = {'cod_Staz,C,254':'Codice stazione'}, inplace = True)
liguria.rename(columns = {'sostanza,C,254':'Sostanza'}, inplace = True)
liguria.rename(columns = {'conc_max,N,33,15':'Conc_max'}, inplace = True)
liguria.rename(columns = {'conc_media,N,33,15':'Conc_media'}, inplace = True)

merged = liguria.merge(italia, on='Codice stazione', how='left')

merged_cleaned = merged[['Codice stazione',"Sostanza", "Conc_max", 'Comune']]

merged_no_zero = merged_cleaned[merged_cleaned.Conc_max != 0]

#grouped = merged_cleaned.set_index(['Sostanza', 'Comune'])

#export results in a new csv
merged_cleaned.to_csv('data/processed/ScatterPlotAcqua.csv', header=True)
merged_no_zero.to_csv('data/processed/ScatterPlotAcquaNoZero.csv', header=True)