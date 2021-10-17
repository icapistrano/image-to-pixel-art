""""
This code is hosted in AWS Lambda. 
Client post request data of: base64 img, size of block and number of colours.
Client recieves an array of pixels between 0 - k colours and the common rgb in k count.
"""

import cv2
import json
import base64
import numpy as np

def lambda_handler(event, context):
    body = json.loads(event["body"])
    
    img_base64 = body["base64"]
    
    block_size = body["block_size"]
    colour_cluster = body["colour_cluster"]
    
    cv2_img = decode_base64(img_base64)
    pixelated_img = pixelate(cv2_img, block_size)
    pixel_groups, colour_of_k = find_common_colour(pixelated_img, colour_cluster)
    
    body = {
        "pixels":pixel_groups,
        "colour_of_k":colour_of_k
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET'
        },
        'body': json.dumps(body)
    }
    
def decode_base64(base64_string):
    byte_img = base64.b64decode(base64_string) # img as bytes
    np_img = np.frombuffer(byte_img, dtype=np.uint8) # pixels in one array
    cv2_img = cv2.imdecode(np_img, cv2.IMREAD_UNCHANGED) # cv2 image
    return cv2_img
    
def pixelate(img, block_size):
    downscale = cv2.resize(img, None, fx=1/block_size, fy=1/block_size, interpolation=cv2.INTER_AREA)
    upscale = cv2.resize(downscale, (img.shape[1], img.shape[0]), fx=1*block_size, fy=1*block_size, interpolation=cv2.INTER_NEAREST)
    return upscale
    
def find_common_colour(img, k):
    Z = img.reshape((-1, img.shape[-1]))
    Z = np.float32(Z) # convert to np.float32

    # define criteria, number of clusters(K) and apply kmeans()
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    ret,label,center=cv2.kmeans(Z,k,None,criteria,10,cv2.KMEANS_RANDOM_CENTERS)
    
    center = np.uint8(center)
    res = center[label.flatten()]

    pixels, colour_of_k = [], {}
    
    for cluster, colour in zip(label.tolist(), res):
        pixels.append(cluster[0])
        
        if cluster[0] not in colour_of_k:
            bgra = colour.tolist()
            argb = bgra[::-1] # reverse channels
            alpha = argb.pop(0) # remove alpha at start and append at end
            rgba = argb.append(alpha)
            rgba = argb
            
            colour_of_k[cluster[0]] = rgba

    return pixels, colour_of_k

