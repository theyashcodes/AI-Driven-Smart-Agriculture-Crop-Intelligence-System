import requests
response = requests.get("https://api.open-meteo.com/v1/forecast?latitude=22.5&longitude=78.9&current=temperature_2m,relative_humidity_2m,surface_pressure&hourly=soil_moisture_1_to_3cm")
print(response.json()['hourly']['soil_moisture_1_to_3cm'][0])
