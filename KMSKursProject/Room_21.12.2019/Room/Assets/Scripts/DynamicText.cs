using UnityEngine;

public class DynamicText : MonoBehaviour {

    [SerializeField]
    Camera cameraPos;
	// Use this for initialization
	void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
        Vector3 cameradir = cameraPos.transform.forward.normalized;//узнали направление камеры
        transform.forward = cameradir;
        
	}
}
