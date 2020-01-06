using UnityEngine;

public class MoveDrug : MonoBehaviour {
    [SerializeField]
    private new Transform camera;

    [SerializeField]
    float max;

    [SerializeField]
    float min;

    bool startdrug = false;

    private void Start()
    {
    }

    private void OnMouseDrag()
    {
        startdrug = true;
    }

    private void OnMouseUp()
    {
        startdrug = false;
    }

    private void FixedUpdate()
    {
        if (startdrug)
        {
            float value;
            if (camera.localPosition.x > 0) value = transform.localPosition.z + Input.GetAxis("Mouse X") * 0.5f;
            else value = transform.localPosition.z - Input.GetAxis("Mouse X") * 0.5f;

            if (value > max && value < min)
            {
                transform.localPosition = new Vector3(transform.localPosition.x, transform.localPosition.y, value);
            }
        }
    }
}
