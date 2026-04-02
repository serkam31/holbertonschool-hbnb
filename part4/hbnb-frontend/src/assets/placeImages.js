import img1 from './TQ4GY5UKMLXLMSIGQ5EKBP76OY.jpg'
import img2 from './unnamed.jpg'
import img3 from './detenus-gangs-prison-salvador.avif'
import img4 from './images.png'
import img5 from './hero.png'
import img6 from './macron.webp'

const placeImages = [img1, img2, img3, img4, img5, img6]

const overrides = {
  '2f89b28e-ea93-4c7d-88c4-7f5170027ef0': img4,
  '3425bc81-b746-48bc-a7cd-a1cf3ae9c7de': img3,
}

export function getPlaceImage(placeId) {
  if (overrides[placeId]) return overrides[placeId]
  let hash = 0
  for (let i = 0; i < placeId.length; i++) {
    hash = ((hash << 5) - hash + placeId.charCodeAt(i)) | 0
  }
  return placeImages[Math.abs(hash) % placeImages.length]
}
