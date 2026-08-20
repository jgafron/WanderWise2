#test
import urllib.parse
import requests
from bs4 import BeautifulSoup

def makeResponseData(status, name, data=None):
    response = {}
    response['status'] = status
    if data:
        response['results'] = len(data)
        response[name] = data
    else:
        response['results'] = None
        response[name] = None
    return response

def getDestinations(region):
    url = 'https://www.atlasobscura.com/destinations'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    destinations = {}
    for item in soup.find_all('li', class_='global-region-item'):
        continent_soup = item.div
        continent_name = continent_soup.h2.text.strip()
        destinations[continent_name] = []
        for country in continent_soup.find_all('a', class_='detail-md non-decorated-link'):
            destinations[continent_name].append(country.text);

    # region parameter
    if region:
        return destinations[region.replace('-', ' ')]
    else:
        return destinations



def getAttractions(country, city=None, state=None, sort="ranked", limit=16, offset=0):
    # Base URL
    url = "https://www.atlasobscura.com/things-to-do/"

    print(f"Fetching URL: {url}")

    # Append City if Available
    if city:
        url += city + '-'

    # Use State Instead of Country if in the U.S.
    if state:
        country = state

    # Append Country and Query Parameters
    url += f"{country}/places"
    if 0 < offset <= 16:
        url += f"&page={offset + 1}"
    if sort == "recent":
        url += "&sort=recent"

    print(f"Fetching: {url}")  # Debugging

    # Fetch and Parse the Page
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error fetching data: {response.status_code}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")
    attractions = []

    # Find all attraction cards
    for card in soup.find_all("a", class_="Card --content-card-v2 --content-card-item Card--flat")[:limit]:
        try:
            curr_attraction = {}

            # Name
            name_tag = card.find("h3", class_="Card__heading --content-card-v2-title js-title-content")
            curr_attraction["name"] = name_tag.get_text(strip=True) if name_tag else "Unknown"

            # Location (City, Country)
            location_tag = card.find("div", class_="Card__hat --place")
            curr_attraction["location"] = location_tag.get_text(strip=True) if location_tag else "Unknown"

            # Description (if available)
            desc_tag = card.find("div", class_="Card__content js-subtitle-content")
            curr_attraction["description"] = desc_tag.get_text(strip=True) if desc_tag else "No description available"

            # Coordinates
            lat = card.get("data-lat")
            lng = card.get("data-lng")
            curr_attraction["coordinates"] = [float(lat), float(lng)] if lat and lng else None

            # Image Thumbnail
            img_tag = card.find("img")
            curr_attraction["img"] = img_tag["data-src"] if img_tag and "data-src" in img_tag.attrs else None

            # Path (Construct Full URL)
            curr_attraction["path"] = "https://www.atlasobscura.com" + card["href"]

            attractions.append(curr_attraction)

        except Exception as e:
            print(f"Error parsing attraction: {e}")

    return attractions

def getFoodandDrink(country, offset, limit, region=None):
    foods = []
    url = 'https://www.atlasobscura.com/unique-food-drink'
    if country:
        url += ('/' + country)
        if offset != 0:
            url += '?page=' + str(offset + 1)
    if region:
        url += '#' + region.replace('-', '%20')
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    cards = soup.find_all('a', class_='content-card food-card')
    if country:
        start = 0
        end = limit
    else:
        start = offset * 16
        end = start + limit
    for card in cards[start:end]:
        curr_food = {}
        # CATEGORY
        curr_food['category'] = card.find('div',
        class_='detail-sm food-card-label food-card-supertag').text
        # NAME
        curr_food['name'] = card.find('h3',
        class_='title-md content-card-title').text.strip()
        # REGION
        if region:
            curr_food['region'] = card.parent['data-region'][2:-2]
        elif country:
            curr_food['region'] = country
        # DESCRIPTION
        curr_food['description'] = card.find('div',
        class_='content-card-subtitle content-card-subtitle-food'
        ' js-subtitle-content').text
        # IMAGE THUMBNAIL
        curr_food['img'] = card.find('img')['data-src']
        # PATH
        curr_food['path'] = card['href']
        # ADD Food
        foods.append(curr_food)

    return foods

def getGastroPlaces(country, offset=0, limit=30):
    """Scrapes cool places to eat from Atlas Obscura."""
    
    # Updated base URL
    url = f'https://www.atlasobscura.com/cool-places-to-eat/{country}'

    print(f"Fetching gastro places from URL: {url}")

    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to fetch data. HTTP Status: {response.status_code}")
            return []

        soup = BeautifulSoup(response.content, 'html.parser')
        places = []

        # Find all food place cards (Update class names based on inspection)
        cards = soup.find_all('a', class_='Card--flat')[:limit]
        print(f"Found {len(cards)} gastro places.")

        for card in cards:
            try:
                curr_place = {}

                # Name
                name_tag = card.find('h3', class_='Card__heading')
                curr_place['name'] = name_tag.text.strip() if name_tag else "Unknown"

                # Location
                location_tag = card.find('div', class_='Card__hat')
                curr_place['location'] = location_tag.text.strip() if location_tag else "Unknown"

                # Description
                desc_tag = card.find('div', class_='Card__content')
                curr_place['description'] = desc_tag.text.strip() if desc_tag else "No description available."

                image_tag = card.find('img')

                # First, try extracting 'data-src' (used for lazy-loading images)
                if image_tag and image_tag.has_attr('data-src'):
                    curr_place['img'] = image_tag['data-src']
                # If 'data-src' is missing, fall back to 'src'
                elif image_tag and image_tag.has_attr('src'):
                    curr_place['img'] = image_tag['src']
                # If no image is found, use a placeholder
                else:
                    curr_place['img'] = 'https://via.placeholder.com/250'

                # Path/URL
                curr_place['path'] = card['href'] if card and 'href' in card.attrs else None

                places.append(curr_place)

            except Exception as e:
                print(f"Error processing a place: {e}", exc_info=True)

        print(f"Returning {len(places)} gastro places.")

        return places

    except Exception as e:
        print(f"Error fetching gastro places: {e}", exc_info=True)
        return []

# TEST CODE HERE
#response = getAttractions('germany', 'berlin')
#print(json.dumps(response, separators=(',',':'), indent=3))
