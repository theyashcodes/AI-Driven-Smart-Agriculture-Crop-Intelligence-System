
def calculate_ndvi(nir, red):
    ndvi = (nir - red) / (nir + red)
    return ndvi

def crop_health(ndvi):
    if ndvi > 0.6:
        return "Healthy Crop"
    elif ndvi > 0.3:
        return "Moderate Growth"
    else:
        return "Poor Crop Health"
